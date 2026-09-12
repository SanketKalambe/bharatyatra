// db/seed_gov.js
const { db } = require('./database.js');

function initGovTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS gov_initiatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      badge TEXT NOT NULL,
      description TEXT NOT NULL,
      perks TEXT NOT NULL,
      official_code TEXT
    );

    CREATE TABLE IF NOT EXISTS asi_monuments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      state TEXT NOT NULL,
      entry_fee_inr INTEGER NOT NULL,
      visiting_hours TEXT NOT NULL,
      category TEXT DEFAULT 'UNESCO World Heritage',
      image_url TEXT,
      unesco_heritage INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS gov_pledges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizen_name TEXT NOT NULL,
      citizen_email TEXT,
      state_residence TEXT,
      pledge_ref TEXT UNIQUE NOT NULL,
      destinations_target INTEGER DEFAULT 15,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const countInit = db.prepare('SELECT COUNT(*) as c FROM gov_initiatives').get().c;
  if (countInit === 0) {
    const insert = db.prepare(
      'INSERT INTO gov_initiatives (name, department, badge, description, perks, official_code) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const initiatives = [
      [
        'Dekho Apna Desh',
        'Ministry of Tourism, Govt of India',
        'National Tourism Mission',
        'National travel pledge: visit at least 15 domestic tourist destinations across India to unlock Ministry travel incentives, certificates, and state tourism partner subsidies.',
        'Official Certificate + INR 1000 Citizen Travel Credits + State Tourism Tax Rebates',
        'DAD-2026'
      ],
      [
        'IRCTC Bharat Gaurav Tourist Trains',
        'Ministry of Railways',
        'Rail Tourism Circuit',
        'All-inclusive theme-based tourist circuit trains showcasing rich cultural heritage: Ramayana Circuit, Jyotirlinga Yatra, Guru Kripa Yatra, and North East discovery with onboard dining and off-board transfers.',
        'Zero Surge Rail Pricing + Dedicated Tourist Coaches + Verified Onboard Security',
        'BG-IRCTC'
      ],
      [
        'ASI Monument Digital Fast-Pass',
        'Archaeological Survey of India (MoC)',
        'Heritage E-Ticketing',
        'Direct digital entry ticketing across 3,690+ centrally protected monuments and UNESCO world heritage sites with zero queue waiting and direct government tariffs.',
        'Direct Official Govt Fares (INR 40-50) + Instant QR Mobile Entry + Zero Gateway Surcharge',
        'ASI-PASS'
      ],
      [
        'ONDC Open Mobility Protocol',
        'DPIIT, Ministry of Commerce & Industry',
        'Digital Public Infrastructure',
        'Open network mobility enabling direct hailing of local autorickshaws, taxis, and state transport buses with 0 percent intermediary platform commission.',
        '25 to 35 percent Lower Fares for Travellers + 100 percent Direct Payout to Local Drivers',
        'ONDC-MOB'
      ],
      [
        'NIDHI & SAATHI Certified Stays',
        'Ministry of Tourism, Govt of India',
        'Hospitality Standards',
        'National Integrated Database of Hospitality Industry. Verified rural, tribal, and heritage homestays meeting strict hygiene, safety, and fire norms.',
        'Government Verified Safety Audit + Authentic Local Cultural Exposure',
        'NIDHI-SAATHI'
      ],
      [
        'Swadesh Darshan 2.0 & PRASHAD',
        'Ministry of Tourism, Govt of India',
        'Spiritual & Eco Tourism',
        'Integrated development of pilgrimage and heritage circuits, riverfront ghat facilities, and indigenous handicraft artisan clusters.',
        'Direct Fair-Trade Artisan Procurement + Upgraded Ghat Amenities',
        'SWADESH-PRASHAD'
      ]
    ];
    for (const item of initiatives) {
      insert.run(...item);
    }
    console.log('Seeded ' + initiatives.length + ' government initiatives.');
  }

  const countMon = db.prepare('SELECT COUNT(*) as c FROM asi_monuments').get().c;
  if (countMon === 0) {
    const insertMon = db.prepare(
      'INSERT INTO asi_monuments (name, state, entry_fee_inr, visiting_hours, category, image_url, unesco_heritage) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const monuments = [
      ['Ajanta & Ellora Caves', 'Maharashtra', 40, '09:00 AM - 05:30 PM (Closed Mon)', 'UNESCO World Heritage', 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=600&q=80', 1],
      ['Taj Mahal & Agra Fort', 'Uttar Pradesh', 50, 'Sunrise to Sunset (Closed Fri)', 'UNESCO World Heritage', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80', 1],
      ['Hampi Monuments & Stone Chariot', 'Karnataka', 40, '06:00 AM - 06:00 PM (All Days)', 'UNESCO World Heritage', 'https://images.unsplash.com/photo-1600100397608-f010f443b794?auto=format&fit=crop&w=600&q=80', 1],
      ['Red Fort & Qutub Minar', 'Delhi', 50, '07:00 AM - 06:00 PM (All Days)', 'UNESCO World Heritage', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80', 1],
      ['Konark Sun Temple', 'Odisha', 40, '06:00 AM - 08:00 PM (All Days)', 'UNESCO World Heritage', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80', 1],
      ['Mahabalipuram Shore Temples', 'Tamil Nadu', 40, '06:00 AM - 06:00 PM (All Days)', 'UNESCO World Heritage', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80', 1]
    ];
    for (const m of monuments) {
      insertMon.run(...m);
    }
    console.log('Seeded ' + monuments.length + ' ASI monuments.');
  }
}

initGovTables();
console.log('Gov integration tables ready!');
