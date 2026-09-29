# ParkIn — Next-Gen Smart City Parking & Mobility Platform

[![Microsoft Hackathon](https://img.shields.io/badge/Microsoft-Hackathon%20Project-0078D4?logo=microsoft&logoColor=white)](https://github.com/hackathon-microsoft/parking-)
[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6%20Modules-cyan)](https://developer.mozilla.org/)
[![IoT Architecture](https://img.shields.io/badge/IoT-Azure%20IoT%20Gateway%20Sim-10b981)](https://azure.microsoft.com/en-us/products/iot-hub)
[![Design](https://img.shields.io/badge/UI%2FUX-Glassmorphism%20%26%20Neon-8b5cf6)](#ui-and-design-features)

**ParkIn** is an intelligent, real-time smart parking management and spot reservation platform built for modern urban mobility hubs, enterprise campuses, and smart cities.

---

## 🌟 Key Features

### 1. Interactive 2D Real-Time Floor Deck Plan
- **Multi-Level Navigation**: Easily switch between **Level P1** (EV Fast Charging & Main Plaza), **Level P2** (Premium Covered & Valet), and **Level P3** (Express & Long Term).
- **Sub-Second Bay States**: Visual status indicators for **Available (Emerald Glow)**, **Occupied (Muted Rose)**, **Reserved (Amber)**, and **50kW Fast Charging (Cyan)**.
- **Lane Direction & Overhead Signage**: Realistic entry/exit lane markings, speed guidance, and ultrasonic sensor status banners.

### 2. Live IoT Sensor Flow Simulation
- **Automated Vehicle Inflow & Outflow**: Background engine simulates cars arriving, parking in available bays, and departing, triggering live telemetry updates.
- **Barrier Gate Chimes**: Procedural Web Audio API sound synthesizer triggers audio cues as cars cross the barrier and slots are reserved (with one-click mute/unmute).
- **Sub-Second Telemetry Sync**: Real-time counter of open bays, EV slots, and deck occupancy percentages.

### 3. Smart Spot Reservation & Digital Pass Generation
- **Dynamic Pricing Engine**: Hourly calculations adjusted for vehicle classification (Sedan, SUV +15%, Motorcycle -20%, EV).
- **Mobility Add-Ons**: Integrated add-ons for **50kW EV Fast Charging**, **Valet Curbside Delivery**, and **Waterless Eco Wash**.
- **Digital Parking Pass Ticket**: Generates an authentic digital pass with:
  - Procedural Canvas-rendered **Gate QR Code** for optical barrier scanner recognition.
  - License Plate Recognition (LPR) reference.
  - Expiration timestamp and total fee breakdown.
  - One-click print/save functionality.

### 4. Real-Time Telemetry & Predictive Analytics
- **Live Deck Occupancy Gauge**: Instant capacity tracking.
- **Predictive Peak Hour Demand Histogram**: Visualizes morning commute, lunch peak, and evening departure demand curves.
- **IoT Edge Gateway Monitor**: Real-time health, packet throughput, and latency monitor simulating Azure IoT Hub integration.

### 5. Persistent Active Session Widget
- **Countdown Timer**: Displays time remaining on your active reservation right on the bottom floating HUD.
- **Quick Session Extension**: One-click `+1 Hour` extension button.
- **Direct Ticket Access**: Instantly open your gate pass QR code from anywhere on the page.

---

## 🚀 Getting Started

### Option 1: Direct Browser Launch
Open `index.html` in any modern web browser (Edge, Chrome, Firefox, Safari).

### Option 2: Run via Local Python Server
```bash
python -m http.server 3000
```
Then navigate to:
```
http://localhost:3000
```

---

## 🏗️ Architecture & File Structure

```
parking-/
├── index.html              # Main application shell with semantic HTML5
├── css/
│   ├── main.css            # Design tokens, typography, glassmorphism, animations
│   ├── parking-map.css     # Floor deck plan, bay slots, lane markings, hover states
│   └── dashboard.css       # KPI metrics, analytics histogram, booking modal & tickets
├── js/
│   ├── app.js              # Application controller, DOM wiring & toast notifications
│   ├── data.js             # Floor configurations, mock locations & IoT nodes
│   ├── parkingMap.js       # Interactive map renderer, bay selection & filtering
│   ├── booking.js          # Reservation engine, procedural QR code & session timers
│   ├── simulation.js       # IoT vehicle inflow/departure simulation loop
│   └── sound.js            # Procedural Web Audio API synthesizer effects
└── README.md               # Project documentation
```

---

## 🎨 UI & Design System

- **Color Palette**: Deep cosmic slate (`#070a12`, `#0e1526`), vibrant electric cyan (`#06b6d4`), emerald green (`#10b981`), and neon amber (`#f59e0b`).
- **Typography**: Google Fonts [`Outfit`](https://fonts.google.com/specimen/Outfit) for sleek headings and [`JetBrains Mono`](https://fonts.google.com/specimen/JetBrains+Mono) for telemetry readouts and license plates.
- **Zero Heavy Dependencies**: 100% vanilla web standards for ultra-fast load times and instantaneous rendering.