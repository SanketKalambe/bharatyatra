// server.js - BharatYatra Full-Stack Backend API Server
const express = require("express");
const cors = require("cors");
const path = require("path");
const { db } = require("./db/database.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// ================= API ENDPOINTS =================

// 1. GET /api/regions - Fetch all exploration regions
app.get("/api/regions", (req, res) => {
  try {
    const regions = db.prepare("SELECT * FROM regions ORDER BY id ASC").all();
    res.json({ success: true, count: regions.length, data: regions });
  } catch (err) {
    console.error("Error fetching regions:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET /api/trips - Fetch customizable trips
app.get("/api/trips", (req, res) => {
  try {
    let sql = "SELECT * FROM trips";
    if (req.query.popular) {
      sql += " WHERE is_popular = 1";
    }
    sql += " ORDER BY id ASC";

    const trips = db.prepare(sql).all().map(t => ({
      ...t,
      tags: typeof t.tags === "string" ? JSON.parse(t.tags) : t.tags,
      is_favorited: Boolean(t.is_favorited)
    }));

    res.json({ success: true, count: trips.length, data: trips });
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. GET /api/trips/:id - Get trip details + day-by-day itinerary
app.get("/api/trips/:id", (req, res) => {
  try {
    const trip = db.prepare("SELECT * FROM trips WHERE id = ?").get(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    trip.tags = typeof trip.tags === "string" ? JSON.parse(trip.tags) : trip.tags;
    trip.is_favorited = Boolean(trip.is_favorited);

    const days = db.prepare(
      "SELECT * FROM itinerary_days WHERE trip_id = ? ORDER BY day_number ASC"
    ).all(req.params.id);

    res.json({ success: true, data: { ...trip, itinerary: days } });
  } catch (err) {
    console.error("Error fetching trip details:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/trips/:id/favorite - Toggle wishlist favorite
app.post("/api/trips/:id/favorite", (req, res) => {
  try {
    const trip = db.prepare("SELECT is_favorited FROM trips WHERE id = ?").get(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const nextState = trip.is_favorited ? 0 : 1;
    db.prepare("UPDATE trips SET is_favorited = ? WHERE id = ?").run(nextState, req.params.id);

    if (nextState === 1) {
      db.prepare("INSERT OR IGNORE INTO wishlist (trip_id) VALUES (?)").run(req.params.id);
    } else {
      db.prepare("DELETE FROM wishlist WHERE trip_id = ?").run(req.params.id);
    }

    res.json({
      success: true,
      trip_id: Number(req.params.id),
      is_favorited: Boolean(nextState),
      message: nextState ? "Added to your wishlist ❤️" : "Removed from wishlist"
    });
  } catch (err) {
    console.error("Error toggling favorite:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/ai/chat - AI Travel Planner Copilot Engine
app.post("/api/ai/chat", (req, res) => {
  try {
    const { prompt = "", session_id = "session_" + Date.now() } = req.body;
    const lower = prompt.toLowerCase();

    let destination = "Incredible India";
    let days = 7;
    let theme = "Cultural, Scenic & Local Food Mix";
    let budget = "₹24,999";
    let stops = ["Historic Old Town", "Artisanal Village", "Scenic Viewpoint", "Local Market"];

    const isAffordable = lower.includes("affordable") || lower.includes("budget") || lower.includes("cheap") || lower.includes("pocket") || lower.includes("student") || lower.includes("low cost") || lower.includes("5000") || lower.includes("4000") || lower.includes("3000") || lower.includes("8000") || lower.includes("10000");

    if (isAffordable) {
      if (lower.includes("rishikesh") || lower.includes("mountain") || lower.includes("uttarakhand") || lower.includes("himalaya")) {
        destination = "Backpacker Rishikesh & Haridwar";
        theme = "Pocket-Friendly Himalayan Adventure, Youth Hostels & Ganga Aarti";
        budget = "₹3,999";
        days = 3;
        stops = ["Haridwar Har Ki Pauri Ganga Aarti", "Rishikesh Backpacker Hostel", "White Water Rafting Grade III", "Chotiwala Traditional Thali", "Beatles Ashram & Sunset Aarti"];
      } else if (lower.includes("varanasi") || lower.includes("spiritual") || lower.includes("temple")) {
        destination = "Varanasi Spiritual Backpacker";
        theme = "Ancient Ghats, Shared Sunrise Wooden Row-Boat & Banarasi Food Walk";
        budget = "₹3,499";
        days = 3;
        stops = ["Assi Ghat Morning Yoga", "Dashashwamedh Evening Ganga Aarti", "Shared Wooden Row-Boat Ride", "Kachori Gali & Blue Lassi Walk", "Sarnath Stupa Shared Auto Ride"];
      } else if (lower.includes("rajasthan") || lower.includes("jaipur") || lower.includes("desert")) {
        destination = "Student Budget Rajasthan Loop";
        theme = "Heritage Haveli Hostels, Desert Cart Rides & Vibrant Street Bazaars";
        budget = "₹6,499";
        days = 5;
        stops = ["Jaipur Pink City Walking Trail", "Amer Fort Shared Shuttle & Stepwell", "Pushkar Lake & Sunset Cafe", "Desert Campfire & Local Dal Baati", "Ajmer Sharif Dargah"];
      } else {
        destination = "Pocket-Friendly Sahyadri & Konkan Trek";
        theme = "Scenic Rail Trails, Youth Hostels, Fort Treks & Authentic Local Thalis";
        budget = "₹4,999";
        days = 4;
        stops = ["Central Railway scenic ghat ride to Lonavala", "Karla Buddhist Caves", "Sinhagad Fort trek & authentic Pithla Bhakri", "Alibaug budget homestay & ferry ride"];
      }
    } else if (lower.includes("maharashtra") || lower.includes("mumbai") || lower.includes("pune")) {
      destination = "Maharashtra Explorer";
      theme = "Historic Maratha Forts, Western Ghats & Coastal Seafood";
      budget = "₹22,999";
      stops = ["Mumbai (Colaba & Elephanta)", "Pune (Shaniwar Wada)", "Sinhagad Fort", "Nashik Vineyards", "Alibaug Coast"];
    } else if (lower.includes("northeast") || lower.includes("north east") || lower.includes("meghalaya") || lower.includes("assam")) {
      destination = "North East Wilderness";
      theme = "Living Root Bridges, Tea Estates & Sacred Groves";
      budget = "₹28,500";
      stops = ["Guwahati Kamakhya", "Shillong Hills", "Cherrapunji Waterfalls", "Mawlynnong Village", "Kaziranga Safari"];
    } else if (lower.includes("temple") || lower.includes("spiritual") || lower.includes("varanasi") || lower.includes("ayodhya")) {
      destination = "Spiritual Heartlands";
      theme = "Sacred Ghats, Ancient Vedic Rituals & Temple Architecture";
      budget = "₹23,500";
      days = 8;
      stops = ["Varanasi Ghats (Ganga Aarti)", "Sarnath Deer Park", "Ayodhya Ram Mandir", "Prayagraj Sangam", "Bodh Gaya"];
    } else if (lower.includes("family") || lower.includes("children") || lower.includes("kids")) {
      destination = "Family Discovery Route";
      theme = "Comfortable Heritage Stays, Wildlife Safaris & Kid-Friendly Trails";
      budget = "₹32,000";
      days = 6;
      stops = ["Jaipur City Palace & Amer Fort", "Ranthambore Tiger Safari", "Chokhi Dhani Cultural Village", "Udaipur Lake Pichola"];
    } else if (lower.includes("himalaya") || lower.includes("rishikesh") || lower.includes("mountain") || lower.includes("uttarakhand")) {
      destination = "Himalayan Escape";
      theme = "River Rafting, Alpine Meadows & Forest Eco-Lodges";
      budget = "₹26,000";
      days = 8;
      stops = ["Rishikesh Yoga & Rafting", "Devprayag Confluence", "Auli Ropeway & Snow Peaks", "Jim Corbett Tiger Reserve"];
    } else if (lower.includes("kerala") || lower.includes("south")) {
      destination = "South India Highlights";
      theme = "Tranquil Backwaters, Spice Plantations & Dravidian Temples";
      budget = "₹29,999";
      days = 9;
      stops = ["Kochi Fort & Kathakali", "Munnar Tea Hills", "Thekkady Spice Trails", "Alleppey Houseboat", "Madurai Meenakshi"];
    }

    const numMatch = lower.match(/(\d+)\s*(day|days)/);
    if (numMatch) {
      days = parseInt(numMatch[1], 10);
    }

    const budgetBadge = isAffordable 
      ? `<div style="display:inline-block;background:#eaf8ef;color:#0b7a48;padding:4px 10px;border-radius:6px;font-size:11.5px;font-weight:bold;margin-bottom:8px;border:1px solid #b7e3cb;">🎒 Verified Pocket-Friendly Route (Saver Choice)</div><br>` 
      : "";

    const savingsTip = isAffordable
      ? `<br><div style="background:#f4faf6;border:1px dashed #22c55e;border-radius:8px;padding:8px 12px;font-size:11.5px;color:#185338;margin-top:10px;">💡 <strong>Money Saving Tip:</strong> Save even more by opting for Indian Railways scenic rail sleeper/3AC and community youth hostels in the customizer!</div>`
      : "";

    const reply = `${budgetBadge}✨ <strong>Custom AI Plan: ${destination} (${days} Days)</strong><br><br>
    <strong>🎨 Theme:</strong> ${theme}<br>
    <strong>💰 Est. Cost:</strong> ${budget} / traveller (Includes stays, transport & guided trails)<br><br>
    <strong>🗺️ Suggested Key Stops:</strong><br>
    ${stops.map((s, idx) => `&bull; <em>Stop ${idx + 1}:</em> ${s}`).join("<br>")}<br><br>
    <strong>👥 Assigned Local Partners:</strong> 3 Verified drivers & guides ready.${savingsTip}<br>
    <em>Click <strong>"Start Customising"</strong> to adjust dates, stay type, or add destinations!</em>`;

    // Persist to database
    db.prepare("INSERT INTO ai_messages (session_id, sender, message, metadata) VALUES (?, ?, ?, ?)").run(
      session_id, "user", prompt, JSON.stringify({ destination, days, isAffordable })
    );
    db.prepare("INSERT INTO ai_messages (session_id, sender, message, metadata) VALUES (?, ?, ?, ?)").run(
      session_id, "ai", reply, JSON.stringify({ destination, days, budget, stops, isAffordable })
    );

    res.json({
      success: true,
      session_id,
      reply,
      details: { destination, days, budget, stops }
    });
  } catch (err) {
    console.error("Error in AI chat:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST /api/bookings - Create and persist booking
app.post("/api/bookings", (req, res) => {
  try {
    const {
      destination,
      travel_date,
      travellers = 1,
      category = "Plan with AI",
      customer_name = "Guest Traveller",
      customer_email = "guest@bharatyatra.in",
      transport_mode = "Private Cab & Scenic Rail",
      stay_type = "Verified Heritage Homestay"
    } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, message: "Destination is required." });
    }

    const booking_ref = "BY-" + new Date().getFullYear() + "-" + Math.floor(100000 + Math.random() * 900000);
    const estimated_price = (parseInt(travellers, 10) || 1) * 18500;

    const stmt = db.prepare(`
      INSERT INTO bookings (
        booking_ref, trip_title, destination, travel_date, travellers,
        category, status, total_price, customer_name, customer_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      booking_ref,
      destination + " Custom Journey",
      destination,
      travel_date || "Upcoming Season",
      parseInt(travellers, 10) || 1,
      category,
      "confirmed",
      estimated_price,
      customer_name,
      customer_email
    );

    res.json({
      success: true,
      booking_ref,
      message: "Booking confirmed successfully! Local partners assigned.",
      booking: {
        booking_ref,
        destination,
        travel_date: travel_date || "Upcoming Season",
        travellers: parseInt(travellers, 10) || 1,
        transport_mode,
        stay_type,
        category,
        total_price: estimated_price,
        status: "confirmed"
      }
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. GET /api/partners - Fetch local partner network
app.get("/api/partners", (req, res) => {
  try {
    const partners = db.prepare("SELECT * FROM local_partners ORDER BY rating DESC").all();
    res.json({ success: true, count: partners.length, data: partners });
  } catch (err) {
    console.error("Error fetching partners:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. POST /api/partners/register - Partner signup
app.post("/api/partners/register", (req, res) => {
  try {
    const { name, role, location, bio } = req.body;
    if (!name || !role || !location) {
      return res.status(400).json({ success: false, message: "Name, role, and location are required." });
    }
    const stmt = db.prepare("INSERT INTO local_partners (name, role, location, bio) VALUES (?, ?, ?, ?)");
    const info = stmt.run(name, role, location, bio || "Experienced local partner");
    res.json({ success: true, message: "Welcome to BharatYatra partner community!", partner_id: Number(info.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    user: {
      name: email ? email.split("@")[0] : "Traveller",
      email: email || "traveller@bharatyatra.in"
    },
    message: "Logged in successfully!"
  });
});

// 10. GET /api/stats - Platform metrics
app.get("/api/stats", (req, res) => {
  try {
    const tripsCount = db.prepare("SELECT COUNT(*) as count FROM trips").get().count;
    const regionsCount = db.prepare("SELECT COUNT(*) as count FROM regions").get().count;
    const bookingsCount = db.prepare("SELECT COUNT(*) as count FROM bookings").get().count;
    const partnersCount = db.prepare("SELECT COUNT(*) as count FROM local_partners").get().count;

    res.json({
      success: true,
      stats: {
        total_destinations: "500+",
        verified_partners: "25K+",
        travellers_empowered: "150K+",
        economic_impact: "₹10 Cr+",
        regions_live: regionsCount,
        active_trips: tripsCount,
        bookings_made: bookingsCount,
        partners_registered: partnersCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= GOVERNMENT & PUBLIC SECTOR APIS =================

// 11. GET /api/gov/initiatives - Ministry of Tourism & Public Programs
app.get("/api/gov/initiatives", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM gov_initiatives ORDER BY id ASC").all();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. GET /api/gov/monuments - ASI Protected Heritage Monuments
app.get("/api/gov/monuments", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM asi_monuments ORDER BY id ASC").all();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. POST /api/gov/monuments/book - Instant ASI Digital QR Ticket
app.post("/api/gov/monuments/book", (req, res) => {
  try {
    const { monument_id = 1, visitor_name = "Citizen Traveller", visitors = 1, visit_date } = req.body;
    const monument = db.prepare("SELECT * FROM asi_monuments WHERE id = ?").get(monument_id);
    if (!monument) {
      return res.status(404).json({ success: false, message: "Monument not found" });
    }

    const booking_ref = "ASI-2026-" + Math.floor(100000 + Math.random() * 900000);
    const total_fee = monument.entry_fee_inr * (parseInt(visitors, 10) || 1);

    db.prepare(`
      INSERT INTO bookings (
        booking_ref, trip_title, destination, travel_date, travellers,
        category, status, total_price, customer_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      booking_ref,
      `ASI Pass: ${monument.name}`,
      `${monument.name}, ${monument.state}`,
      visit_date || "Valid for 30 Days",
      parseInt(visitors, 10) || 1,
      "ASI Digital Pass",
      "confirmed",
      total_fee,
      visitor_name
    );

    res.json({
      success: true,
      booking_ref,
      monument: monument.name,
      state: monument.state,
      visiting_hours: monument.visiting_hours,
      total_fee,
      message: "Official ASI QR Entry Pass Issued! Valid for direct entry without queue."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. POST /api/gov/pnr - IRCTC Live PNR Status Check
app.post("/api/gov/pnr", (req, res) => {
  try {
    const { pnr = "" } = req.body;
    const cleanPnr = pnr.replace(/[^0-9]/g, "");

    const mockTrains = [
      { train_no: "20608", name: "Vande Bharat Express", from: "CSMT", to: "Pune", coach: "C3", berth: "45 (Window)", status: "CNF (Confirmed)", chart: "Chart Prepared" },
      { train_no: "12123", name: "Deccan Queen Express", from: "Mumbai", to: "Pune", coach: "D2", berth: "28 (Aisle)", status: "CNF (Confirmed)", chart: "Chart Prepared" },
      { train_no: "12301", name: "Rajdhani Express", from: "NDLS", to: "HWH", coach: "B4", berth: "19 (Lower)", status: "CNF (Confirmed)", chart: "Chart Prepared" },
      { train_no: "00401", name: "Bharat Gaurav Ramayana Circuit", from: "Delhi Safdarjung", to: "Ayodhya/Janakpur", coach: "BG-2", berth: "12 (Tourist 2AC)", status: "CNF (Heritage Tourist)", chart: "All-Inclusive Circuit" }
    ];

    const idx = (cleanPnr.split("").reduce((acc, c) => acc + parseInt(c, 10), 0) || 0) % mockTrains.length;
    const trainInfo = mockTrains[idx];

    res.json({
      success: true,
      pnr: cleanPnr || "2489102847",
      data: trainInfo,
      rail_authority: "Ministry of Railways (CRIS / IRCTC)"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. GET /api/gov/ondc/compare - ONDC 0% Commission Fare Analysis
app.get("/api/gov/ondc/compare", (req, res) => {
  res.json({
    success: true,
    protocol: "ONDC Open Mobility (Beckn Protocol)",
    comparison: {
      route: "Local Railway Station to Heritage Homestay",
      private_aggregator_fare: "₹420",
      ondc_direct_fare: "₹295",
      traveller_savings: "30% Lower Cost",
      driver_payout: "100% Direct to Local Family (₹295)",
      benefits: [
        "Zero surge multiplier charges",
        "Direct instant UPI settlement to local family drivers",
        "Empowers local auto rickshaw unions & state road transport"
      ]
    }
  });
});

// 16. POST /api/gov/pledge - Dekho Apna Desh Citizen Pledge
app.post("/api/gov/pledge", (req, res) => {
  try {
    const { citizen_name = "Proud Citizen", citizen_email = "citizen@bharatyatra.in", state = "Maharashtra" } = req.body;
    const pledge_ref = "DAD-PLG-2026-" + Math.floor(10000 + Math.random() * 90000);

    db.prepare(`
      INSERT INTO gov_pledges (citizen_name, citizen_email, state_residence, pledge_ref)
      VALUES (?, ?, ?, ?)
    `).run(citizen_name, citizen_email, state, pledge_ref);

    res.json({
      success: true,
      pledge_ref,
      citizen_name,
      state,
      travel_credit: "₹1,000 BharatYatra Citizen Credit Added",
      message: "Dekho Apna Desh citizen pledge registered! Welcome to the national tourism movement."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express Server
app.listen(PORT, "127.0.0.1", () => {
  console.log(`BharatYatra Express API & Server is LIVE on http://127.0.0.1:${PORT}`);
});
