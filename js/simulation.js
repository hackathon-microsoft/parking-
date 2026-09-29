/* ==========================================================================
   ParkPulse - Live IoT Sensor & Vehicle Flow Simulator
   ========================================================================== */

import { sound } from './sound.js';

export class IoTFlowSimulator {
  constructor(floorsData, onStateChange) {
    this.floors = floorsData;
    this.onStateChange = onStateChange;
    this.isRunning = true;
    this.intervalId = null;
    this.simulatedCars = 18;
    this.hourlyArrivalRate = 34;
  }

  start() {
    if (this.intervalId) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), 3800);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  toggle() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
    return this.isRunning;
  }

  tick() {
    // Pick random level
    const levelKeys = ['P1', 'P2', 'P3'];
    const randomLevel = levelKeys[Math.floor(Math.random() * levelKeys.length)];
    const spots = this.floors[randomLevel].spots;

    // Random choice: car arrives (60% chance) or car departs (40% chance)
    const isArrival = Math.random() < 0.6;

    if (isArrival) {
      // Find an available spot
      const availableSpots = spots.filter(s => s.status === 'available');
      if (availableSpots.length > 0) {
        const spotToTake = availableSpots[Math.floor(Math.random() * availableSpots.length)];
        spotToTake.status = 'occupied';
        spotToTake.vehiclePlate = `WA-${Math.floor(100 + Math.random() * 899)}-AZ`;
        sound.playBarrierChime();
        this.onStateChange({
          type: 'arrival',
          level: randomLevel,
          spot: spotToTake
        });
      }
    } else {
      // Find an occupied spot to vacate
      const occupiedSpots = spots.filter(s => s.status === 'occupied');
      if (occupiedSpots.length > 3) { // keep a reasonable baseline
        const spotToFree = occupiedSpots[Math.floor(Math.random() * occupiedSpots.length)];
        spotToFree.status = 'available';
        spotToFree.vehiclePlate = null;
        this.onStateChange({
          type: 'departure',
          level: randomLevel,
          spot: spotToFree
        });
      }
    }
  }
}
