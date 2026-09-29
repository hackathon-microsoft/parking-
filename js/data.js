/* ==========================================================================
   ParkIn - Clean, Simplified Parking Locations & Floor Spots
   ========================================================================== */

export const LOCATIONS = [
  {
    id: 'bldg-99',
    name: 'Microsoft Campus - Bldg 99',
    address: 'One Microsoft Way, Redmond, WA',
    ratePerHour: 5.00,
    openHours: '24/7 Access'
  },
  {
    id: 'downtown-deck',
    name: 'Downtown Tech District',
    address: '400 Pine Street, Seattle, WA',
    ratePerHour: 6.00,
    openHours: '5:00 AM - 1:00 AM'
  },
  {
    id: 'metro-airport',
    name: 'Airport Express Deck',
    address: '17801 International Blvd, Seattle, WA',
    ratePerHour: 8.00,
    openHours: '24/7 Access'
  }
];

// Helper to generate 12 clean, spacious spots per level (6 top, 6 bottom)
function createLevelSpots(levelPrefix, baseRate, evSlots, occupiedSlots) {
  const spots = [];
  for (let i = 1; i <= 12; i++) {
    const id = `${levelPrefix}-${i < 10 ? '0' + i : i}`;
    const isEV = evSlots.includes(i);
    const isOccupied = occupiedSlots.includes(i);

    spots.push({
      id,
      level: levelPrefix,
      index: i,
      type: isEV ? 'ev' : 'standard',
      status: isOccupied ? 'occupied' : 'available',
      evPower: isEV ? '50 kW Fast' : null,
      ratePerHour: baseRate + (isEV ? 2.00 : 0.00),
      distanceToLift: `${Math.floor(10 + i * 2.5)}m`
    });
  }
  return spots;
}

export const INITIAL_FLOORS = {
  'P1': {
    name: 'Level P1 — Main Plaza & EV Fast Chargers',
    description: 'Closest parking to building entrance with high-speed 50kW EV charging bays.',
    baseRate: 5.00,
    spots: createLevelSpots('P1', 5.00, [1, 2, 3, 4], [2, 5, 8, 11])
  },
  'P2': {
    name: 'Level P2 — Covered & Valet Deck',
    description: 'Fully covered floor with optional curbside valet drop-off.',
    baseRate: 5.00,
    spots: createLevelSpots('P2', 5.00, [1, 2], [1, 4, 7, 9, 12])
  },
  'P3': {
    name: 'Level P3 — Long-Term & Express',
    description: 'Spacious lower level ideal for multi-hour stays and daily parking.',
    baseRate: 4.00,
    spots: createLevelSpots('P3', 4.00, [1], [3, 6, 8, 10])
  }
};
