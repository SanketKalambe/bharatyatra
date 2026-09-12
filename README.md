# 🇮🇳 BharatYatra — Travel India. Experience Local.

An authentic, community-first travel portal and smart discovery platform for exploring India's heritage, culture, spiritual circuits, and landscapes. Built with official Indian government tourism integrations, direct local partnerships, and an embedded full-stack architecture.

---

## ✨ Features

### 🏛️ Official Government Tourism Integrations
- **Ministry of Tourism — Dekho Apna Desh**: Take the national 15-destination domestic travel pledge, generate verified pledge certificates, and claim ₹1,000 travel credits.
- **Indian Railways (IRCTC & CRIS)**: Live PNR status tracking with seat/berth and chart verification; curated Bharat Gaurav rail circuits.
- **Archaeological Survey of India (ASI)**: 1-click skip-the-line QR pass booking for Centrally Protected & UNESCO World Heritage monuments (Taj Mahal, Red Fort, Ajanta & Ellora Caves, Konark Sun Temple, Hampi).
- **ONDC Open Mobility (DPIIT)**: Zero-commission direct-driver ride booking via Beckn protocol with instant fare savings.

### 🔍 Executive-Grade Search Engine
- **Airbnb & Stripe Style Search Bar**: Rounded pill geometry with responsive width expansion on focus.
- **Keyboard Shortcuts**: Instant access using Ctrl + K or / from anywhere on the page.
- **Intelligent Autocomplete**: Shows trending searches, quick filter chips, and live multi-category matching (packages, regions, ASI monuments) with keyword highlighting.

### 🎒 Affordable & Pocket-Friendly Travel
- Direct community homestays and backpacker packages starting at **₹3,499**.
- Filter packages by price: Under ₹5k, Under ₹10k, ₹10k–₹25k, and Premium/All-Inclusive.

### 🤖 AI Travel Copilot & Interactive Customizer
- Embedded AI travel assistant with preset prompts for weekend getaways, cultural trails, and budget itineraries.
- Interactive day-by-day trip customizer modal to configure travellers, dates, food preferences, and instant booking references.

### 🌐 Multi-Currency Converter
- Live dynamic currency switching between **INR (₹)**, **USD ($)**, **EUR (€)**, and **GBP (£)** across all packages.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, ES6+ JavaScript (Zero external CSS framework dependencies, 100% responsive).
- **Backend**: Node.js, Express.js.
- **Database**: SQLite (using Node.js native 
ode:sqlite DatabaseSync module) with WAL mode.
- **APIs**: 16+ REST endpoints covering trips, bookings, AI chat, regions, and government initiatives.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v22.x or higher recommended for native 
ode:sqlite support)
- Git

### Installation

1. **Clone the repository:**
   `ash
   git clone https://github.com/SanketKalambe/bharatyatra.git
   cd bharatyatra
   `

2. **Install dependencies:**
   `ash
   npm install
   `

3. **Start the server:**
   `ash
   npm start
   `

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/trips | Get all travel packages (supports budget filtering) |
| GET | /api/trips/:id | Get detailed trip package with itinerary |
| POST | /api/trips/:id/favorite | Toggle trip wishlist |
| GET | /api/regions | Get cultural destination regions |
| POST | /api/bookings | Create new reservation |
| POST | /api/ai/chat | AI Travel Copilot assistant |
| GET | /api/gov/initiatives | Ministry of Tourism schemes & incentives |
| POST | /api/gov/pledge | Register Dekho Apna Desh citizen pledge |
| POST | /api/gov/pnr | Live Indian Railways PNR status verification |
| GET | /api/gov/monuments | ASI protected monuments directory |
| POST | /api/gov/monuments/book | Issue instant ASI fast-pass QR entry |
| GET | /api/gov/ondc/compare | ONDC zero-commission mobility savings comparison |

---

## 📄 License
This project is licensed under the ISC License.
