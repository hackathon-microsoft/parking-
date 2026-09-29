/* ==========================================================================
   ParkIn - Main Application Controller
   ========================================================================== */

import { LOCATIONS, INITIAL_FLOORS, HOURLY_PEAK_DATA, IOT_TELEMETRY_NODES } from './data.js';
import { ParkingMap } from './parkingMap.js';
import { BookingManager } from './booking.js';
import { IoTFlowSimulator } from './simulation.js';
import { sound } from './sound.js';
import { HindsightMemoryClient } from './hindsight.js';

class App {
  constructor() {
    this.floors = INITIAL_FLOORS;
    this.currentLocation = LOCATIONS[0];
    this.map = null;
    this.bookingManager = null;
    this.simulator = null;
    this.hindsight = new HindsightMemoryClient();
  }

  init() {
    // 1. Initialize Booking Manager
    this.bookingManager = new BookingManager({
      onBookingSuccess: (booking) => {
        // Update spot status in data
        const spot = this.findSpotById(booking.spotId);
        if (spot) {
          spot.status = 'reserved';
          this.map.render();
          this.updateKPIs();
          this.showToast(`Success! Spot ${booking.spotId} is reserved for you.`, 'success');
        }

        // Retain booking into Hindsight AI Memory
        this.hindsight.retain('booking', booking);
        this.renderHindsightMemoryGraph();
      }
    });

    // 2. Initialize Parking Map
    this.map = new ParkingMap('parking-map-container', this.floors, (spot) => {
      this.renderSpotDetails(spot);
    });
    this.map.init();

    // 3. Initialize IoT Simulator
    this.simulator = new IoTFlowSimulator(this.floors, (event) => {
      this.map.render();
      this.updateKPIs();
      if (this.map.selectedSpot && this.map.selectedSpot.id === event.spot.id) {
        this.renderSpotDetails(event.spot);
      }
      const actionText = event.type === 'arrival' ? 'Car parked at' : 'Car departed from';
      this.showToast(`IoT Sensor: ${actionText} ${event.spot.id}`, 'info');
    });
    this.simulator.start();

    // 4. Wire UI Event Listeners
    this.bindEvents();

    // 5. Initial Data Render
    this.updateKPIs();
    this.renderPeakHoursChart();
    this.renderIoTNodes();
    this.renderHindsightMemoryGraph();
  }

  findSpotById(spotId) {
    for (const lvl in this.floors) {
      const match = this.floors[lvl].spots.find(s => s.id === spotId);
      if (match) return match;
    }
    return null;
  }

  bindEvents() {
    // Floor Level Tabs
    const tabs = document.querySelectorAll('.level-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const level = tab.getAttribute('data-level');
        this.map.setLevel(level);
        document.getElementById('current-level-title').textContent = this.floors[level].name;
        document.getElementById('current-level-desc').textContent = this.floors[level].description;
      });
    });

    // Quick Filter Chips/Select
    const filterSelect = document.getElementById('spot-type-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.map.setFilter(e.target.value);
        sound.playClick();
      });
    }

    // Location Select
    const locationSelect = document.getElementById('location-select');
    if (locationSelect) {
      locationSelect.addEventListener('change', (e) => {
        const loc = LOCATIONS.find(l => l.id === e.target.value);
        if (loc) {
          this.currentLocation = loc;
          document.getElementById('selected-location-name').textContent = loc.name;
          document.getElementById('selected-location-addr').textContent = loc.address;
          sound.playClick();
          this.showToast(`Switched to ${loc.name}`, 'info');
        }
      });
    }

    // Sound Toggle Button
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isEnabled = sound.toggle();
        soundBtn.classList.toggle('active', isEnabled);
        soundBtn.title = isEnabled ? 'Audio Effects: ON' : 'Audio Effects: MUTED';
        this.showToast(isEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted', 'info');
      });
    }

    // Simulation Toggle Button
    const simBtn = document.getElementById('btn-sim-toggle');
    const simStatusText = document.getElementById('sim-status-label');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        const isRunning = this.simulator.toggle();
        simBtn.classList.toggle('active', isRunning);
        if (simStatusText) {
          simStatusText.textContent = isRunning ? 'SIMULATION ACTIVE' : 'SIMULATION PAUSED';
        }
        this.showToast(isRunning ? 'Live IoT Stream Resumed' : 'Live IoT Stream Paused', 'info');
      });
    }

    // Reserve Spot Button in Sidebar
    const reserveBtn = document.getElementById('btn-book-selected-spot');
    if (reserveBtn) {
      reserveBtn.addEventListener('click', () => {
        if (this.map.selectedSpot) {
          sound.playClick();
          this.bookingManager.openBooking(this.map.selectedSpot);
        }
      });
    }

    // View My Bookings Button
    const myBookingsBtn = document.getElementById('btn-my-bookings');
    if (myBookingsBtn) {
      myBookingsBtn.addEventListener('click', () => {
        sound.playClick();
        if (this.bookingManager.currentSession) {
          this.bookingManager.renderDigitalTicket(this.bookingManager.currentSession);
        } else {
          this.showToast('No active bookings found. Select an available spot to reserve!', 'info');
        }
      });
    }

    // Hindsight AI Concierge Drawer Open/Close
    const openHindsightBtn = document.getElementById('btn-open-hindsight');
    const closeHindsightBtn = document.getElementById('close-hindsight-drawer');
    const hindsightDrawer = document.getElementById('hindsight-drawer');

    if (openHindsightBtn && hindsightDrawer) {
      openHindsightBtn.addEventListener('click', () => {
        sound.playSlotSelect();
        hindsightDrawer.classList.add('open');
        this.renderHindsightMemoryGraph();
      });
    }

    if (closeHindsightBtn && hindsightDrawer) {
      closeHindsightBtn.addEventListener('click', () => {
        hindsightDrawer.classList.remove('open');
      });
    }

    // Hindsight Tabs: Chat vs Memory Graph
    const tabChat = document.getElementById('tab-chat-mode');
    const tabGraph = document.getElementById('tab-graph-mode');
    const chatBody = document.getElementById('hindsight-chat-body');
    const graphPanel = document.getElementById('hindsight-memory-panel');
    const inputBar = document.querySelector('.hindsight-input-bar');

    if (tabChat && tabGraph) {
      tabChat.addEventListener('click', () => {
        tabChat.classList.add('active');
        tabGraph.classList.remove('active');
        chatBody.style.display = 'flex';
        graphPanel.style.display = 'none';
        if (inputBar) inputBar.style.display = 'flex';
      });

      tabGraph.addEventListener('click', () => {
        tabGraph.classList.add('active');
        tabChat.classList.remove('active');
        chatBody.style.display = 'none';
        graphPanel.style.display = 'flex';
        if (inputBar) inputBar.style.display = 'none';
        this.renderHindsightMemoryGraph();
      });
    }

    // Quick Prompt Pills
    document.querySelectorAll('.prompt-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const text = pill.getAttribute('data-prompt');
        this.handleHindsightQuery(text);
      });
    });

    // Chat Text Input & Send
    const sendBtn = document.getElementById('hindsight-send-btn');
    const chatInput = document.getElementById('hindsight-input');

    const submitQuery = () => {
      const q = chatInput.value.trim();
      if (!q) return;
      chatInput.value = '';
      this.handleHindsightQuery(q);
    };

    if (sendBtn) sendBtn.addEventListener('click', submitQuery);
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitQuery();
      });
    }
  }

  handleHindsightQuery(queryText) {
    const chatBody = document.getElementById('hindsight-chat-body');
    if (!chatBody) return;

    sound.playClick();

    // 1. Append User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = queryText;
    chatBody.appendChild(userBubble);

    // 2. Process with Hindsight Agent Memory
    const result = this.hindsight.processQuery(queryText, this.floors);

    // 3. Append Assistant Bubble
    setTimeout(() => {
      sound.playSlotSelect();
      const botBubble = document.createElement('div');
      botBubble.className = 'chat-bubble assistant';
      botBubble.innerHTML = `
        <div>${result.text}</div>
        ${result.memoryUsed ? `<div class="memory-tag-badge">🧠 Hindsight: ${result.memoryUsed}</div>` : ''}
        ${result.recommendedSpotId ? `
          <button class="primary-btn" id="btn-select-rec-spot" style="margin-top: 0.6rem; padding: 0.35rem 0.8rem; font-size: 0.78rem;">
            Highlight ${result.recommendedSpotId} on Map
          </button>
        ` : ''}
      `;
      chatBody.appendChild(botBubble);
      chatBody.scrollTop = chatBody.scrollHeight;

      if (result.recommendedSpotId) {
        const btn = botBubble.querySelector('#btn-select-rec-spot');
        if (btn) {
          btn.addEventListener('click', () => {
            const spot = this.findSpotById(result.recommendedSpotId);
            if (spot) {
              if (this.map.currentLevel !== spot.level) {
                this.map.setLevel(spot.level);
                // Update tabs active state
                document.querySelectorAll('.level-tab').forEach(t => {
                  t.classList.toggle('active', t.getAttribute('data-level') === spot.level);
                });
              }
              this.map.selectSpot(spot);
              document.getElementById('parking-map-container').scrollIntoView({ behavior: 'smooth' });
              this.showToast(`Selected ${spot.id} recommended by Hindsight`, 'success');
            }
          });
        }
      }
    }, 280);

    chatBody.scrollTop = chatBody.scrollHeight;
  }

  renderHindsightMemoryGraph() {
    const mem = this.hindsight.memories;
    if (!mem) return;

    const plateEl = document.getElementById('mem-plate');
    if (plateEl) plateEl.textContent = mem.driver.plate;

    const vehicleEl = document.getElementById('mem-vehicle');
    if (vehicleEl) vehicleEl.textContent = mem.driver.vehicleType;

    const chargerEl = document.getElementById('mem-charger');
    if (chargerEl) chargerEl.textContent = `${mem.driver.preferredCharger} (${mem.driver.preferredLevel})`;

    const episodesList = document.getElementById('mem-episodes-list');
    if (episodesList) {
      episodesList.innerHTML = mem.history.map(ep => `
        <div class="memory-item-row">
          <div>
            <strong>${ep.spotId}</strong> <span style="font-size: 0.75rem; color: var(--text-dim);">(${ep.date})</span>
            <div style="font-size: 0.72rem; color: var(--cyan-primary);">${ep.addOns && ep.addOns.length ? ep.addOns.join(', ') : 'Standard Stay'}</div>
          </div>
        </div>
      `).join('');
    }
  }

  renderSpotDetails(spot) {
    const emptyState = document.getElementById('spot-empty-state');
    const detailContent = document.getElementById('spot-detail-content');
    const reserveBtn = document.getElementById('btn-book-selected-spot');

    if (!spot) {
      if (emptyState) emptyState.style.display = 'flex';
      if (detailContent) detailContent.style.display = 'none';
      if (reserveBtn) reserveBtn.disabled = true;
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (detailContent) detailContent.style.display = 'block';

    document.getElementById('sidebar-spot-id').textContent = spot.id;
    const pill = document.getElementById('sidebar-status-pill');
    pill.className = `detail-status-pill pill-${spot.status}`;
    pill.textContent = spot.status.toUpperCase();

    document.getElementById('sidebar-type').textContent = spot.type.toUpperCase();
    document.getElementById('sidebar-distance').textContent = spot.distanceToLift;
    document.getElementById('sidebar-rate').textContent = `$${spot.ratePerHour.toFixed(2)}`;
    document.getElementById('sidebar-sensor-id').textContent = spot.sensorId;

    const evBox = document.getElementById('sidebar-ev-info');
    if (spot.type === 'ev' && spot.evPower) {
      evBox.style.display = 'flex';
      document.getElementById('sidebar-ev-power').textContent = spot.evPower;
    } else {
      evBox.style.display = 'none';
    }

    if (reserveBtn) {
      if (spot.status === 'available') {
        reserveBtn.disabled = false;
        reserveBtn.innerHTML = `<span>⚡ Reserve Spot ${spot.id}</span>`;
      } else {
        reserveBtn.disabled = true;
        reserveBtn.innerHTML = `<span>Spot ${spot.status.toUpperCase()}</span>`;
      }
    }
  }

  updateKPIs() {
    let total = 0;
    let available = 0;
    let evOpen = 0;

    for (const lvl in this.floors) {
      this.floors[lvl].spots.forEach(s => {
        total++;
        if (s.status === 'available') {
          available++;
          if (s.type === 'ev') evOpen++;
        }
      });
    }

    const occupiedPercent = Math.round(((total - available) / total) * 100);

    const occRateEl = document.getElementById('kpi-occupancy-rate');
    if (occRateEl) occRateEl.textContent = `${occupiedPercent}%`;

    const openSpotsEl = document.getElementById('kpi-open-spots');
    if (openSpotsEl) openSpotsEl.textContent = available;

    const evOpenEl = document.getElementById('kpi-ev-open');
    if (evOpenEl) evOpenEl.textContent = evOpen;

    const bannerOpenEl = document.getElementById('banner-available-count');
    if (bannerOpenEl) bannerOpenEl.textContent = `${available} Available`;
  }

  renderPeakHoursChart() {
    const container = document.getElementById('peak-hours-chart');
    if (!container) return;

    container.innerHTML = HOURLY_PEAK_DATA.map(d => `
      <div class="bar-col ${d.isPeak ? 'peak' : ''}" title="${d.hour}: ${d.load}% Occupancy">
        <div class="bar-fill-track">
          <div class="bar-fill" style="height: ${d.load}%;"></div>
        </div>
        <span class="bar-label">${d.hour}</span>
      </div>
    `).join('');
  }

  renderIoTNodes() {
    const listEl = document.getElementById('iot-nodes-list');
    if (!listEl) return;

    listEl.innerHTML = IOT_TELEMETRY_NODES.map(node => `
      <div class="iot-row">
        <div class="iot-node-name">
          <span class="pulse-dot" style="width: 6px; height: 6px;"></span>
          ${node.name}
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim);">${node.latency}</span>
          <span class="iot-status-tag tag-online">${node.status}</span>
        </div>
      </div>
    `).join('');
  }

  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Bootstrap on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  window.parkInApp = new App();
  window.parkInApp.init();
});
