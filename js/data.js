/* ==========================================================================
   ParkIn - Mock IoT Data, Locations, Rates and Floor Configurations
   ========================================================================== */

export const LOCATIONS = [
  {
    id: 'bldg-99',
    name: 'Microsoft Campus - Bldg 99 Hub',
    address: 'One Microsoft Way, Redmond, WA',
    ratePerHour: 4.50,
    totalSpots: 72,
    hasEV: true,
    hasValet: true,
    openHours: '24/7 Access'
  },
  {
    id: 'downtown-deck',
    name: 'Downtown Tech District Deck',
    address: '400 Pine Street, Seattle, WA',
    ratePerHour: 6.00,
    totalSpots: 140,
    hasEV: true,
    hasValet: false,
    openHours: '5:00 AM - 1:00 AM'
  },
  {
    id: 'metro-airport',
    name: 'Metro Terminal Express Deck',
    address: '17801 International Blvd, Seattle, WA',
    ratePerHour: 8.50,
    totalSpots: 210,
    hasEV: true,
    hasValet: true,
    openHours: '24/7 Access'
  }
];

export const HOURLY_PEAK_DATA = [
  { hour: '08:00', load: 45, isPeak: false },
  { hour: '10:00', load: 85, isPeak: true },
  { hour: '12:00', load: 92, isPeak: true },
  { hour: '14:00', load: 78, isPeak: false },
  { hour: '16:00', load: 88, isPeak: true },
  { hour: '18:00', load: 95, isPeak: true },
  { hour: '20:00', load: 60, isPeak: false },
  { hour: '22:00', load: 30, isPeak: false }
];

export const IOT_TELEMETRY_NODES = [
  { id: 'IOT-HUB-AZURE-01', name: 'Azure IoT Gateway - North Deck', status: 'Online', latency: '9ms', packets: '48.2k/s' },
  { id: 'IOT-BARRIER-ENTRY', name: 'Smart Barrier & LPR Camera A', status: 'Online', latency: '14ms', packets: '12.4k/s' },
  { id: 'IOT-ULTRASONIC-P1', name: 'P1 Ultrasonic Sensor Array', status: 'Online', latency: '11ms', packets: '92.1k/s' },
  { id: 'IOT-EV-GRID-CTRL', name: 'Dynamic EV Load Balancer', status: 'Online', latency: '18ms', packets: '6.8k/s' }
];

// Helper to generate spots for a level
function generateLevelSpots(levelPrefix, count, config) {
  const spots = [];
  for (let i = 1; i <= count; i++) {
    const id = `${levelPrefix}-${i < 10 ? '0' + i : i}`;
    let type = 'standard';
    let status = 'available';
    let evPower = null;

    if (config.evSlots && config.evSlots.includes(i)) {
      type = 'ev';
      evPower = i % 2 === 0 ? '50 kW Fast' : '22 kW AC';
    } else if (config.accessibleSlots && config.accessibleSlots.includes(i)) {
      type = 'accessible';
    } else if (config.vipSlots && config.vipSlots.includes(i)) {
      type = 'vip';
    }

    // Assign initial occupied states
    if (config.occupiedInitial && config.occupiedInitial.includes(i)) {
      status = 'occupied';
    } else if (config.reservedInitial && config.reservedInitial.includes(i)) {
      status = 'reserved';
    }

    spots.push({
      id,
      level: levelPrefix,
      index: i,
      type,
      status,
      evPower,
      ratePerHour: config.baseRate + (type === 'ev' ? 2.5 : type === 'vip' ? 3.0 : 0),
      distanceToLift: `${Math.floor(15 + (i * 3.5))}m`,
      sensorId: `SNSR-${levelPrefix}-${i}`,
      vehiclePlate: status === 'occupied' ? `WA-${Math.floor(100 + Math.random() * 899)}-XY` : null
    });
  }
  return spots;
}

export const INITIAL_FLOORS = {
  'P1': {
    name: 'Level P1 - General & EV Hub',
    description: 'Direct pedestrian access to Main Plaza & EV Fast Chargers',
    baseRate: 4.50,
    spots: generateLevelSpots('P1', 24, {
      baseRate: 4.50,
      evSlots: [1, 2, 3, 4, 5, 6],
      accessibleSlots: [7, 8],
      occupiedInitial: [2, 4, 9, 10, 11, 15, 17, 18, 22],
      reservedInitial: [3, 14]
    })
  },
  'P2': {
    name: 'Level P2 - Premium & Valet Deck',
    description: 'Covered climate-controlled floor with Valet Drop-off',
    baseRate: 5.50,
    spots: generateLevelSpots('P2', 24, {
      baseRate: 5.50,
      evSlots: [1, 2, 3],
      vipSlots: [4, 5, 6, 7, 8],
      accessibleSlots: [9, 10],
      occupiedInitial: [1, 5, 6, 12, 13, 16, 20, 21, 23],
      reservedInitial: [7, 19]
    })
  },
  'P3': {
    name: 'Level P3 - Express & Long Term',
    description: 'Economical multi-day parking with automated shuttle access',
    baseRate: 3.50,
    spots: generateLevelSpots('P3', 24, {
      baseRate: 3.50,
      evSlots: [1, 2],
      accessibleSlots: [3, 4],
      occupiedInitial: [3, 4, 7, 8, 14, 15, 16, 17, 18, 24],
      reservedInitial: [1, 10]
    })
  }
};
