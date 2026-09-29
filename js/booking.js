/* ==========================================================================
   ParkPulse - Reservation Engine, Digital Pass & QR Code Generator
   ========================================================================== */

import { sound } from './sound.js';

export class BookingManager {
  constructor(options = {}) {
    this.modalEl = document.getElementById('booking-modal');
    this.ticketModalEl = document.getElementById('ticket-modal');
    this.activeSessionEl = document.getElementById('active-session-widget');
    this.currentSpot = null;
    this.activeBookings = JSON.parse(localStorage.getItem('parkpulse_bookings') || '[]');
    this.currentSession = JSON.parse(localStorage.getItem('parkpulse_active_session') || 'null');
    this.onBookingSuccess = options.onBookingSuccess || (() => {});

    this.timerInterval = null;
    this.init();
  }

  init() {
    this.initModalEvents();
    if (this.currentSession) {
      this.startSessionTimer(this.currentSession);
    }
  }

  openBooking(spot) {
    if (!spot || spot.status !== 'available') return;
    this.currentSpot = spot;

    // Fill Spot info in modal
    document.getElementById('modal-spot-id').textContent = spot.id;
    document.getElementById('modal-spot-level').textContent = `Level ${spot.level}`;
    document.getElementById('modal-spot-type').textContent = spot.type.toUpperCase();
    document.getElementById('modal-base-rate').textContent = `$${spot.ratePerHour.toFixed(2)}`;

    // Reset default inputs
    document.getElementById('booking-hours').value = '2';
    document.getElementById('license-plate').value = '';
    document.getElementById('addon-ev').checked = spot.type === 'ev';
    document.getElementById('addon-valet').checked = false;
    document.getElementById('addon-wash').checked = false;

    this.recalculateTotal();
    this.modalEl.classList.add('open');
  }

  closeBooking() {
    this.modalEl.classList.remove('open');
    this.currentSpot = null;
  }

  recalculateTotal() {
    if (!this.currentSpot) return;

    const hours = parseFloat(document.getElementById('booking-hours').value) || 1;
    let baseRate = this.currentSpot.ratePerHour;

    const vehicleType = document.getElementById('vehicle-type').value;
    let vehicleMultiplier = 1.0;
    if (vehicleType === 'suv') vehicleMultiplier = 1.15;
    if (vehicleType === 'motorcycle') vehicleMultiplier = 0.8;

    let subtotal = (baseRate * hours) * vehicleMultiplier;

    if (document.getElementById('addon-ev').checked) subtotal += 6.00;
    if (document.getElementById('addon-valet').checked) subtotal += 8.50;
    if (document.getElementById('addon-wash').checked) subtotal += 15.00;

    const totalEl = document.getElementById('booking-total-price');
    if (totalEl) {
      totalEl.textContent = `$${subtotal.toFixed(2)}`;
    }
    return subtotal;
  }

  initModalEvents() {
    const closeBtn = document.getElementById('close-booking-modal');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeBooking());

    const hoursInput = document.getElementById('booking-hours');
    if (hoursInput) hoursInput.addEventListener('input', () => this.recalculateTotal());

    const vehicleSelect = document.getElementById('vehicle-type');
    if (vehicleSelect) vehicleSelect.addEventListener('change', () => this.recalculateTotal());

    ['addon-ev', 'addon-valet', 'addon-wash'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => this.recalculateTotal());
    });

    const confirmBtn = document.getElementById('confirm-booking-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.confirmReservation());
    }

    const closeTicketBtn = document.getElementById('close-ticket-modal');
    if (closeTicketBtn) {
      closeTicketBtn.addEventListener('click', () => {
        this.ticketModalEl.classList.remove('open');
      });
    }

    // Modal background click
    [this.modalEl, this.ticketModalEl].forEach(m => {
      if (m) {
        m.addEventListener('click', (e) => {
          if (e.target === m) m.classList.remove('open');
        });
      }
    });
  }

  confirmReservation() {
    if (!this.currentSpot) return;

    const licensePlate = (document.getElementById('license-plate').value || 'WA-884-DEMO').trim().toUpperCase();
    const hours = parseInt(document.getElementById('booking-hours').value) || 2;
    const vehicleType = document.getElementById('vehicle-type').value;
    const totalAmount = this.recalculateTotal();

    const bookingRef = `PRK-${this.currentSpot.level}-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = Date.now() + (hours * 3600 * 1000);

    const booking = {
      ref: bookingRef,
      spotId: this.currentSpot.id,
      level: this.currentSpot.level,
      spotType: this.currentSpot.type,
      plate: licensePlate,
      hours,
      totalAmount,
      bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      expiresAt,
      vehicleType
    };

    // Save
    this.activeBookings.unshift(booking);
    localStorage.setItem('parkpulse_bookings', JSON.stringify(this.activeBookings));

    this.currentSession = booking;
    localStorage.setItem('parkpulse_active_session', JSON.stringify(this.currentSession));

    this.closeBooking();
    sound.playSuccess();

    // Trigger parent hook
    this.onBookingSuccess(booking);

    // Show ticket
    this.renderDigitalTicket(booking);
    this.startSessionTimer(booking);
  }

  renderDigitalTicket(booking) {
    document.getElementById('ticket-ref').textContent = booking.ref;
    document.getElementById('ticket-spot').textContent = booking.spotId;
    document.getElementById('ticket-level').textContent = `Level ${booking.level}`;
    document.getElementById('ticket-plate').textContent = booking.plate;
    document.getElementById('ticket-total').textContent = `$${booking.totalAmount.toFixed(2)}`;
    document.getElementById('ticket-valid-until').textContent = new Date(booking.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Render Procedural QR Code Canvas
    this.drawProceduralQR('ticket-qr-canvas', booking.ref);

    this.ticketModalEl.classList.add('open');
  }

  drawProceduralQR(canvasId, text) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 140;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Deterministic procedural QR grid based on text hash
    const gridSize = 21;
    const cellSize = Math.floor(size / gridSize);
    const offset = Math.floor((size - (gridSize * cellSize)) / 2);

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = '#0f172a';

    // Corner Finder Patterns
    const drawFinder = (startX, startY) => {
      ctx.fillRect(startX * cellSize + offset, startY * cellSize + offset, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((startX + 1) * cellSize + offset, (startY + 1) * cellSize + offset, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect((startX + 2) * cellSize + offset, (startY + 2) * cellSize + offset, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(0, 0);
    drawFinder(gridSize - 7, 0);
    drawFinder(0, gridSize - 7);

    // Fill data pseudo-randomly with hash seed
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip corner markers
        if ((r < 8 && c < 8) || (r < 8 && c >= gridSize - 8) || (r >= gridSize - 8 && c < 8)) {
          continue;
        }
        const pseudoBit = Math.sin(hash + r * 13 + c * 37) > 0;
        if (pseudoBit) {
          ctx.fillRect(c * cellSize + offset, r * cellSize + offset, cellSize, cellSize);
        }
      }
    }
  }

  startSessionTimer(booking) {
    if (!this.activeSessionEl) return;
    this.activeSessionEl.style.display = 'flex';

    const timerText = document.getElementById('active-timer-display');
    const spotText = document.getElementById('active-session-spot');
    if (spotText) spotText.textContent = booking.spotId;

    if (this.timerInterval) clearInterval(this.timerInterval);

    const update = () => {
      const remainingMs = booking.expiresAt - Date.now();
      if (remainingMs <= 0) {
        if (timerText) timerText.textContent = 'EXPIRED';
        clearInterval(this.timerInterval);
        return;
      }
      const hrs = Math.floor(remainingMs / 3600000);
      const mins = Math.floor((remainingMs % 3600000) / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);
      if (timerText) {
        timerText.textContent = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    };

    update();
    this.timerInterval = setInterval(update, 1000);

    const extendBtn = document.getElementById('btn-extend-session');
    if (extendBtn) {
      extendBtn.onclick = () => {
        booking.expiresAt += 3600 * 1000;
        localStorage.setItem('parkpulse_active_session', JSON.stringify(booking));
        sound.playClick();
        update();
      };
    }

    const viewTicketBtn = document.getElementById('btn-view-active-ticket');
    if (viewTicketBtn) {
      viewTicketBtn.onclick = () => this.renderDigitalTicket(booking);
    }
  }
}
