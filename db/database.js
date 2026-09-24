// db/database.js
const path = require("path");
const fs = require("fs");

let dbPath = path.join(__dirname, "..", "bharatyatra.db");

// In serverless environments like Vercel, copy the SQLite db to /tmp for write access
if (process.env.VERCEL) {
  try {
    const tmpDbPath = path.join("/tmp", "bharatyatra.db");
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, tmpDbPath);
    }
    if (fs.existsSync(tmpDbPath)) {
      dbPath = tmpDbPath;
    }
  } catch (e) {
    console.warn("Could not copy database to /tmp:", e.message);
  }
}

const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync(dbPath);

// Enable WAL mode for performance
try {
  db.exec("PRAGMA journal_mode = WAL;");
} catch (e) {}

// Initialize Schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      tagline TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      region_id INTEGER,
      title TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      locations TEXT NOT NULL,
      price_inr INTEGER NOT NULL,
      tags TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_popular BOOLEAN DEFAULT 1,
      is_favorited BOOLEAN DEFAULT 0,
      overview TEXT,
      FOREIGN KEY (region_id) REFERENCES regions(id)
    );

    CREATE TABLE IF NOT EXISTS itinerary_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      day_number INTEGER NOT NULL,
      city TEXT NOT NULL,
      title TEXT NOT NULL,
      activities TEXT,
      local_food TEXT,
      stay_type TEXT,
      FOREIGN KEY (trip_id) REFERENCES trips(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_ref TEXT UNIQUE NOT NULL,
      trip_title TEXT,
      destination TEXT NOT NULL,
      travel_date TEXT,
      travellers INTEGER DEFAULT 1,
      category TEXT DEFAULT 'custom',
      status TEXT DEFAULT 'confirmed',
      total_price INTEGER DEFAULT 0,
      customer_name TEXT,
      customer_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS local_partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      location TEXT NOT NULL,
      rating REAL DEFAULT 4.9,
      reviews_count INTEGER DEFAULT 100,
      avatar_url TEXT,
      bio TEXT
    );

    CREATE TABLE IF NOT EXISTS ai_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(trip_id)
    );
  `);

  // Check if seeded
  const countRegions = db.prepare("SELECT COUNT(*) as count FROM regions").get();
  if (countRegions.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  console.log("Seeding BharatYatra initial dataset...");

  // Seed Regions
  const insertRegion = db.prepare(
    "INSERT INTO regions (name, tagline, image_url, description) VALUES (?, ?, ?, ?)"
  );
  const regions = [
    ["Maharashtra", "Forts, Food, Culture, Coast", "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=600&q=80", "Land of Maratha warriors, Sahyadri forts, vibrant Mumbai streets, and serene Konkan beaches."],
    ["Rajasthan", "Palaces, Desert, Heritage", "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80", "Royal palaces, Thar desert safaris, rich folk music, and vibrant bazaars."],
    ["Kerala", "Backwaters, Hills, Nature", "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80", "God's Own Country with tranquil Alleppey houseboats, Munnar tea hills, and Ayurvedic wellness."],
    ["Uttarakhand", "Mountains, Temples, Adventure", "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80", "The Land of the Gods with dramatic snow peaks, sacred Char Dham, and Himalayan trekking trails."],
    ["Tamil Nadu", "Temples, Tradition, Coast", "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80", "Magnificent Dravidian temple architecture, classical arts, rich filter coffee, and tranquil coastline."],
    ["North East", "Nature, Tribes, Serenity", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80", "Pristine living root bridges, tea gardens, diverse tribal heritage, and untouched waterfalls."]
  ];
  for (const r of regions) {
    insertRegion.run(...r);
  }

  // Seed Trips
  const insertTrip = db.prepare(
    "INSERT INTO trips (title, duration_days, locations, price_inr, tags, image_url, is_popular, is_favorited, overview) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const trips = [
    [
      "Maharashtra Explorer",
      7,
      "Mumbai, Pune, Nashik, Konkan",
      22999,
      JSON.stringify(["Culture", "Food", "Nature", "Customisable"]),
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=650&q=80",
      1,
      0,
      "Explore historic forts of the Sahyadri mountains, taste authentic Kolhapuri & Konkani seafood, visit Nashik vineyards, and unwind by the Arabian sea."
    ],
    [
      "Spiritual India",
      10,
      "Varanasi, Gaya, Ayodhya, Ujjain",
      28500,
      JSON.stringify(["Temples", "Culture", "Spiritual", "Customisable"]),
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=650&q=80",
      1,
      0,
      "A soulful pilgrimage covering evening Ganga Aarti at Dashashwamedh Ghat, Bodh Gaya meditation trees, sacred Ram Janmabhoomi, and Mahakaleshwar Jyotirlinga."
    ],
    [
      "Himalayan Escape",
      8,
      "Rishikesh, Auli, Jim Corbett",
      26000,
      JSON.stringify(["Adventure", "Nature", "Wellness", "Customisable"]),
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=650&q=80",
      1,
      0,
      "White water river rafting in Rishikesh, high-altitude alpine views and cable cars in Auli, followed by wildlife jeep safari in Jim Corbett National Park."
    ],
    [
      "South India Highlights",
      10,
      "Kerala, Tamil Nadu, Karnataka",
      31200,
      JSON.stringify(["Culture", "Beaches", "Heritage", "Customisable"]),
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=650&q=80",
      1,
      0,
      "A scenic loop traversing Coorg coffee estates, Madurai Meenakshi temple, Alleppey backwater houseboats, and Kochi colonial quarters."
    ],
    [
      "Pocket-Friendly Sahyadri & Konkan Trek",
      4,
      "Lonavala, Sinhagad, Alibaug",
      4999,
      JSON.stringify(["Affordable", "Backpacking", "Trek", "Nature"]),
      "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=650&q=80",
      1,
      0,
      "Ultra-affordable weekend backpacking trail through Sahyadri misty forts, scenic state railway routes, and rustic Konkan beach homestays."
    ],
    [
      "Backpacker Rishikesh & Haridwar",
      3,
      "Haridwar, Rishikesh",
      3999,
      JSON.stringify(["Affordable", "Adventure", "Hostel", "Spiritual"]),
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=650&q=80",
      1,
      0,
      "Pocket-friendly Himalayan adventure: sacred Ganga Aarti at Har Ki Pauri, cliff jump & white water rafting in Rishikesh, and backpacker cafe hopping."
    ],
    [
      "Student Budget Rajasthan Loop",
      5,
      "Jaipur, Pushkar, Ajmer",
      6499,
      JSON.stringify(["Affordable", "Heritage", "Hostels", "Culture"]),
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=650&q=80",
      1,
      0,
      "High-value budget loop exploring Jaipur Pink City, Amer Fort, serene Pushkar sacred lake, and camel desert tracks using local rail & traveler hostels."
    ],
    [
      "Varanasi Spiritual Backpacker",
      3,
      "Varanasi, Sarnath",
      3499,
      JSON.stringify(["Affordable", "Spiritual", "Heritage", "Walks"]),
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=650&q=80",
      1,
      0,
      "Unbeatable value soulful pilgrimage: shared sunrise wooden rowboat on the Ganges, evening Dashashwamedh Aarti, Banarasi street food walk, and Sarnath stupas."
    ]
  ];
  for (const t of trips) {
    insertTrip.run(...t);
  }

  // Seed Day-by-Day Itineraries
  const insertDay = db.prepare(
    "INSERT INTO itinerary_days (trip_id, day_number, city, title, activities, local_food, stay_type) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const days = [
    [1, 1, "Mumbai", "Arrival & Heritage Forts", "Gateway of India, Marine Drive walk, Elephanta Caves ferry", "Vada Pav, Pav Bhaji at Chowpatty", "Boutique Heritage Hotel"],
    [1, 2, "Mumbai to Pune", "Cultural Pune & Shaniwar Wada", "Scenic Expressway drive, Shaniwar Wada fort, Aga Khan Palace", "Misal Pav, Bakarwadi, Mastani", "Traditional Wada Homestay"],
    [1, 3, "Pune to Sinhagad", "Maratha Fortress Expedition", "Hike up Sinhagad Fort, Kalyan Darwaza, Tanaji Malusare memorial", "Pithla Bhakri, Kanda Bhajji", "Eco Resort"],
    [1, 4, "Nashik", "Wine & Temple Trails", "Trimbakeshwar Temple, Sula Vineyards wine tasting & grape stomping", "Khandeshi Shev Bhaji", "Vineyard Villa"],
    [1, 5, "Konkan Coast", "Alibaug & Murud Janjira", "Ferry to Murud Janjira sea fort, Kashid beach sunset", "Malvani Fish Curry, Solkadhi", "Beachside Coconut Grove Stay"],
    [1, 6, "Ratnagiri", "Alphonso Orchards & Coastal Forts", "Jaigad Fort, Ganpatipule beach temple, mango grove walk", "Ukadiche Modak, Poha", "Heritage Coastal Homestay"],
    [1, 7, "Return to Mumbai", "Shopping & Farewell", "Local spice and handicraft shopping, farewell sunset dinner", "Parsi Cafe & Coastal Thali", "Departure"],

    // Affordable Trip 5: Sahyadri & Konkan Trek (4 days)
    [5, 1, "Lonavala", "Ghats Train & Karla Caves", "Central Railway scenic train ride, hike up Karla Buddhist caves, local chikki tasting", "Vada Pav, Masala Chai & Poha (₹80)", "Youth Hostel Dorm"],
    [5, 2, "Sinhagad", "Maratha Fort Hike", "Early morning trek up Sinhagad bastion, Kalyan Darwaza viewpoint, Tanaji memorial", "Hot Pithla Bhakri & Thecha (₹120)", "Rustic Village Homestay"],
    [5, 3, "Alibaug", "Coastal Camping & Fort Walk", "Shared local bus to Alibaug, walk through low-tide to Kolaba Sea Fort, sunset campfire", "Konkani Veg Thali & Solkadhi (₹150)", "Beachside Tent Camping"],
    [5, 4, "Return Ferry", "Mandwa to Mumbai Ferry", "Scenic morning ferry ride to Gateway of India, sea-gull spotting, local spice market", "Mumbai Bun Maska & Irani Chai (₹70)", "Departure"],

    // Affordable Trip 6: Backpacker Rishikesh (3 days)
    [6, 1, "Haridwar", "Har Ki Pauri Ganga Aarti", "Attend iconic evening Ganga Aarti, evening temple bell stroll, watch floating diyas", "Famous Mohan Puri & Aloo Thali (₹90)", "Riverside Ashram Guest House"],
    [6, 2, "Rishikesh", "Ganga White Water Rafting", "12km thrilling river rafting with certified guides, cliff jumping, sunset at Laxman Jhula", "Backpacker Wood-fired Pizza & Chai (₹180)", "Zostel / Backpacker Hostel"],
    [6, 3, "Rishikesh", "Sunrise Kunjapuri & Beatles Ashram", "Sunrise hike over Himalayan snow peaks at Kunjapuri Temple, visit Beatles Ashram graffiti ruins", "Ayurvedic Herbal Thali (₹140)", "Departure"],

    // Affordable Trip 7: Student Rajasthan (5 days)
    [7, 1, "Jaipur", "Pink City Architecture Walk", "Hawa Mahal exterior photoshoot, explore Johari Bazaar handicrafts, City Palace courtyards", "Rawat Pyaaz Kachori & Lassi (₹100)", "Heritage Backpacker Hostel"],
    [7, 2, "Jaipur", "Amer & Nahargarh Sunset", "Shared shuttle to Amer Fort, Nahargarh stepwell, sunset panorama over the entire Pink City", "Rajasthani Dal Baati Churma (₹160)", "Heritage Backpacker Hostel"],
    [7, 3, "Pushkar", "Sacred Lake & Desert Sunset", "Scenic train/bus to Pushkar, circumambulate Pushkar Lake, hike to Savitri Devi Temple", "Pushkar Falafel & Rabdi Malpua (₹120)", "Desert Oasis Homestay"],
    [7, 4, "Pushkar", "Desert Cart & Folk Music", "Local camel cart ride to sand dunes, evening folk Kalbelia music by local desert community", "Traditional Bajra Roti & Gatte ki Sabzi (₹140)", "Desert Oasis Homestay"],
    [7, 5, "Ajmer", "Ajmer Sharif & Farewell", "Visit Hazrat Khwaja Moinuddin Chishti Dargah, peaceful qawwali, return train", "Mughlai Biryani & Sweet Sohan Halwa (₹150)", "Departure"],

    // Affordable Trip 8: Varanasi Spiritual Backpacker (3 days)
    [8, 1, "Varanasi", "Ganga Aarti from Ghats", "Evening walk along the 84 ghats, grand Dashashwamedh Ganga Aarti from the steps", "Banarasi Tamatar Chaat & Chooda Matar (₹80)", "Ghatside Backpacker Haveli"],
    [8, 2, "Varanasi", "Sunrise Boat & Silk Alleys", "Dawn shared wooden row-boat along Assi to Manikarnika Ghat, exploration of ancient weaver alleys", "Kachori Jalebi Breakfast & Blue Lassi (₹110)", "Ghatside Backpacker Haveli"],
    [8, 3, "Sarnath", "Buddha Deer Park & Return", "Shared electric auto to Sarnath, Dhamek Stupa, Ashoka Pillar lion capital museum", "Traditional Poori Sabzi & Malaiyo (₹90)", "Departure"]
  ];
  for (const d of days) {
    insertDay.run(...d);
  }

  // Seed Local Partners
  const insertPartner = db.prepare(
    "INSERT INTO local_partners (name, role, location, rating, reviews_count, avatar_url, bio) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const partners = [
    ["Prakash Deshmukh", "Certified Historian Guide", "Pune & Raigad, MH", 4.95, 184, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=350&q=80", "12 years guiding visitors through Chhatrapati Shivaji Maharaj's hill forts and hidden architecture."],
    ["Keval Ram", "Local Driver & Naturalist", "Nashik & Sahyadris, MH", 4.90, 240, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=350&q=80", "Safe mountain driving specialist with 15+ years experience navigating Western Ghats passes."],
    ["Sunita Patil", "Homestay Host & Chef", "Alibaug, Konkan", 5.0, 112, "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=350&q=80", "Welcomes travellers to her 80-year-old coastal ancestral home with authentic slow-cooked Malvani meals."],
    ["Tenzing Norbu", "High Altitude Trek Leader", "Uttarakhand & Sikkim", 4.98, 96, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80", "Certified mountaineering instructor passionate about conservation and community-led eco tours."]
  ];
  for (const p of partners) {
    insertPartner.run(...p);
  }

  console.log("Database seeded successfully!");
}

initSchema();

module.exports = {
  db,
  initSchema
};
