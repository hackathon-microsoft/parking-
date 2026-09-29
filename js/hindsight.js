/* ==========================================================================
   ParkIn - Hindsight AI Agent Memory Client & Context Provider
   ========================================================================== */

import { sound } from './sound.js';

export class HindsightMemoryClient {
  constructor(options = {}) {
    this.apiEndpoint = options.apiEndpoint || 'http://localhost:8888/v1/memory';
    this.storageKey = 'parkin_hindsight_memories';
    this.memories = this.loadMemories();
    this.onSpotRecommend = options.onSpotRecommend || (() => {});
  }

  loadMemories() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }

    // Default Seed Memories
    return {
      driver: {
        plate: 'WA-884-DEMO',
        vehicleType: 'Electric Vehicle (Tesla Model Y)',
        preferredLevel: 'Level P1',
        preferredCharger: '50 kW Fast Charger',
        proximityPreference: 'Close to elevator / Plaza entrance (< 25m)'
      },
      history: [
        { date: 'Yesterday, 09:15', spotId: 'P1-02', duration: '3 hrs', addOns: ['50kW Fast Charging'] },
        { date: 'Sep 25, 10:30', spotId: 'P1-04', duration: '2 hrs', addOns: ['50kW Fast Charging', 'Valet'] }
      ],
      insights: [
        'Driver strictly prioritizes 50kW fast charging slots with low walking distance to elevator.',
        'Visits Microsoft Bldg 99 Hub predominantly during morning commute peak (09:00 - 10:30 AM).'
      ]
    };
  }

  saveMemories() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.memories));
  }

  /**
   * Retain: Store a new fact or event into Hindsight memory
   */
  async retain(type, data) {
    if (type === 'booking') {
      this.memories.history.unshift({
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        spotId: data.spotId,
        duration: `${data.hours} hrs`,
        addOns: data.addOns || []
      });

      // Reflect on habit
      if (data.spotType === 'ev') {
        this.memories.driver.preferredLevel = `Level ${data.level}`;
      }
    } else if (type === 'custom') {
      this.memories.insights.push(data);
    }

    this.saveMemories();

    // Optionally forward to live Hindsight backend if running
    try {
      fetch(`${this.apiEndpoint}/retain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      }).catch(() => {});
    } catch (e) {
      // offline fallback
    }
  }

  /**
   * Recall: Retrieve relevant memory context based on query
   */
  recall(query) {
    const q = query.toLowerCase();
    const results = [];

    if (q.includes('usual') || q.includes('favorite') || q.includes('prefer')) {
      results.push({
        source: 'Driver Profile',
        fact: `Preferred bay type: ${this.memories.driver.preferredCharger} on ${this.memories.driver.preferredLevel}`
      });
    }

    if (q.includes('last') || q.includes('history') || q.includes('past')) {
      if (this.memories.history.length > 0) {
        const last = this.memories.history[0];
        results.push({
          source: 'Episodic History',
          fact: `Last parked at ${last.spotId} (${last.date}) for ${last.duration}`
        });
      }
    }

    if (q.includes('plate') || q.includes('car') || q.includes('vehicle')) {
      results.push({
        source: 'Entity Memory',
        fact: `Registered plate: ${this.memories.driver.plate} (${this.memories.driver.vehicleType})`
      });
    }

    return results;
  }

  /**
   * Conversational Assistant with Hindsight Memory
   */
  processQuery(userInput, currentFloors) {
    const text = userInput.toLowerCase();
    let responseText = '';
    let memoryUsed = null;
    let recommendedSpotId = null;

    if (text.includes('usual') || text.includes('routine') || text.includes('my spot')) {
      const p1Spots = currentFloors['P1'] ? currentFloors['P1'].spots : [];
      const usualSpot = p1Spots.find(s => s.id === 'P1-01') || p1Spots.find(s => s.type === 'ev');
      const isFree = usualSpot && usualSpot.status === 'available';

      if (isFree) {
        recommendedSpotId = usualSpot.id;
        responseText = `Based on your Hindsight memory profile, your usual 50kW EV bay **${usualSpot.id}** (${usualSpot.distanceToLift} from elevator) is currently available! Would you like me to reserve it?`;
      } else {
        const altSpot = p1Spots.find(s => s.type === 'ev' && s.status === 'available') || p1Spots.find(s => s.status === 'available');
        recommendedSpotId = altSpot ? altSpot.id : 'P1-03';
        responseText = `Your favorite bay is currently occupied, but I recalled your preference for 50kW EV charging near the elevator. I found **${recommendedSpotId}** which is open right now!`;
      }
      memoryUsed = `Recalled driver profile: 50kW EV + Level P1 elevator proximity`;
    } 
    else if (text.includes('last time') || text.includes('where did i park') || text.includes('history')) {
      const last = this.memories.history[0];
      responseText = `According to your Hindsight memory timeline, you last parked in bay **${last.spotId}** on ${last.date} for ${last.duration}.`;
      memoryUsed = `Episodic recall from session history`;
      recommendedSpotId = last.spotId;
    }
    else if (text.includes('ev') || text.includes('charge') || text.includes('charging')) {
      const p1Spots = currentFloors['P1'] ? currentFloors['P1'].spots : [];
      const evSpot = p1Spots.find(s => s.type === 'ev' && s.status === 'available') || p1Spots[0];
      recommendedSpotId = evSpot ? evSpot.id : 'P1-01';
      responseText = `I recall you drive a ${this.memories.driver.vehicleType}. On Level P1, bay **${recommendedSpotId}** features high-power 50kW DC fast charging and is ready for plug-in.`;
      memoryUsed = `Vehicle entity: ${this.memories.driver.vehicleType}`;
    }
    else if (text.includes('remember') || text.includes('profile') || text.includes('who am i')) {
      responseText = `Here is what Hindsight retains about your profile:\n• Vehicle: **${this.memories.driver.plate}** (${this.memories.driver.vehicleType})\n• Floor Preference: **${this.memories.driver.preferredLevel}**\n• Amenity: **${this.memories.driver.preferredCharger}**\n• Total Recorded Visits: **${this.memories.history.length}**`;
      memoryUsed = `Full entity graph inspection`;
    }
    else {
      responseText = `I'm using Hindsight persistent memory to assist you. I remember your vehicle (${this.memories.driver.plate}) and preference for Level P1 EV charging. How can I help you park today?`;
      memoryUsed = `General context recall`;
    }

    return {
      text: responseText,
      memoryUsed,
      recommendedSpotId
    };
  }
}
