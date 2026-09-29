/* ==========================================================================
   ParkIn - Interactive Parking Floor Map Component
   ========================================================================== */

import { sound } from './sound.js';

// SVG Icons for different slot types
const ICONS = {
  carOccupied: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>`,
  carAvailable: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
  carReserved: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  evFast: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 20V13H7l7-10v7h4l-7 10z"/></svg>`,
  accessible: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="4" r="2"/><path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.71-.34-1.56-.25-2.18.23L8.14 9.77C7.43 10.33 7 11.2 7 12.11V18h2v-5.5l1.62-1.3 1.94 9.17c.14.67.73 1.13 1.41 1.13.08 0 .16-.01.24-.02.77-.16 1.26-.92 1.1-1.69L14.12 14h2.38c1.38 0 2.5-1.12 2.5-2.5V13z"/></svg>`
};

export class ParkingMap {
  constructor(containerId, floorsData, onSpotSelect) {
    this.container = document.getElementById(containerId);
    this.floors = floorsData;
    this.currentLevel = 'P1';
    this.selectedSpot = null;
    this.activeFilter = 'all'; // 'all', 'available', 'ev', 'accessible'
    this.onSpotSelect = onSpotSelect;
  }

  init() {
    this.render();
  }

  setLevel(levelKey) {
    if (!this.floors[levelKey]) return;
    this.currentLevel = levelKey;
    this.selectedSpot = null;
    sound.playClick();
    this.render();
    if (this.onSpotSelect) {
      this.onSpotSelect(null);
    }
  }

  setFilter(filterType) {
    this.activeFilter = filterType;
    this.render();
  }

  getFilteredSpots() {
    const allSpots = this.floors[this.currentLevel].spots;
    if (this.activeFilter === 'available') {
      return allSpots.filter(s => s.status === 'available');
    }
    if (this.activeFilter === 'ev') {
      return allSpots.filter(s => s.type === 'ev');
    }
    if (this.activeFilter === 'accessible') {
      return allSpots.filter(s => s.type === 'accessible');
    }
    return allSpots;
  }

  selectSpot(spot) {
    if (spot.status === 'occupied') {
      sound.playTone(300, 'sawtooth', 0.1, 0.1);
      return;
    }
    this.selectedSpot = spot;
    sound.playSlotSelect();
    this.updateSelectionVisuals();
    if (this.onSpotSelect) {
      this.onSpotSelect(spot);
    }
  }

  updateSelectionVisuals() {
    const slots = this.container.querySelectorAll('.parking-slot');
    slots.forEach(slotEl => {
      const id = slotEl.getAttribute('data-spot-id');
      if (this.selectedSpot && id === this.selectedSpot.id) {
        slotEl.classList.add('selected');
      } else {
        slotEl.classList.remove('selected');
      }
    });
  }

  render() {
    if (!this.container) return;

    const floor = this.floors[this.currentLevel];
    const spots = floor.spots;

    // Split 24 spots into 2 rows of 12 for realistic lane drive-through
    const topRow = spots.slice(0, 12);
    const bottomRow = spots.slice(12, 24);

    const renderRow = (rowSpots) => {
      return rowSpots.map(spot => {
        const isDimmed = this.activeFilter !== 'all' && (
          (this.activeFilter === 'available' && spot.status !== 'available') ||
          (this.activeFilter === 'ev' && spot.type !== 'ev') ||
          (this.activeFilter === 'accessible' && spot.type !== 'accessible')
        );

        let iconSvg = ICONS.carAvailable;
        if (spot.status === 'occupied') {
          iconSvg = ICONS.carOccupied;
        } else if (spot.status === 'reserved') {
          iconSvg = ICONS.carReserved;
        } else if (spot.type === 'ev') {
          iconSvg = ICONS.evFast;
        } else if (spot.type === 'accessible') {
          iconSvg = ICONS.accessible;
        }

        const isSelected = this.selectedSpot && this.selectedSpot.id === spot.id;

        return `
          <div class="parking-slot status-${spot.status} ${spot.type === 'ev' ? 'status-ev' : ''} ${isSelected ? 'selected' : ''}"
               data-spot-id="${spot.id}"
               style="${isDimmed ? 'opacity: 0.25; pointer-events: none;' : ''}"
               title="${spot.id} - ${spot.type.toUpperCase()} (${spot.status})">
            <span class="sensor-dot"></span>
            <div class="slot-badge-id">${spot.id}</div>
            <div class="slot-icon-visual">${iconSvg}</div>
            <div class="slot-badge-type type-${spot.type}">
              ${spot.type === 'ev' ? '⚡ ' + (spot.evPower || 'EV') : spot.type}
            </div>
          </div>
        `;
      }).join('');
    };

    this.container.innerHTML = `
      <div class="parking-arena">
        <!-- Top Bay Row (Slots 01 - 12) -->
        <div class="bays-row" id="bay-row-top">
          ${renderRow(topRow)}
        </div>

        <!-- Central Driveway & Sensor Lane Marking -->
        <div class="parking-driveway">
          <div class="driveway-sign">
            <span>◀ ENTRY LANE</span>
            <span style="color: var(--cyan-primary);">SPEED LIMIT 10 MPH</span>
          </div>
          <div class="driveway-sign">
            <span style="color: var(--status-available);">LEVEL ${this.currentLevel} SENSORS ACTIVE</span>
            <span>EXIT / RAMP ▶</span>
          </div>
        </div>

        <!-- Bottom Bay Row (Slots 13 - 24) -->
        <div class="bays-row" id="bay-row-bottom">
          ${renderRow(bottomRow)}
        </div>
      </div>
    `;

    // Attach click listeners
    const slotElements = this.container.querySelectorAll('.parking-slot');
    slotElements.forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-spot-id');
        const spot = spots.find(s => s.id === id);
        if (spot) this.selectSpot(spot);
      });
    });
  }
}
