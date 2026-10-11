const categoryRules = [
  {
    category: "Ethnic Wear",
    terms: [
      "ethnic wear", "ethnic", "traditional", "indian wear", "desi",
      "lehenga", "lehnga", "saree", "sari", "kurti", "kurta", "anarkali",
      "chaniya choli", "ghagra", "dupatta", "salwar", "salwar suit", "sherwani",
      "indo-western", "dhoti", "bandhgala", "nehru jacket", "modi jacket",
      "लहंगा", "साड़ी", "कुर्ती", "कुर्ता", "सलवार", "सलवार सूट", "अनारकली",
      "घाघरा", "चोली", "पारंपरिक", "एथनिक", "शेरवानी", "धोती", "बंदगला"
    ],
  },
  {
    category: "Ladies Wear",
    terms: [
      "ladies wear", "women's wear", "womens wear", "blouse", "choli", "frock", "skirt",
      "maxi", "ladies suit", "gown", "bridal", "ladies", "women", "plazo", "palazzo", "sharara", "gharara",
      "महिला कपड़े", "महिलाओं के कपड़े", "ब्लाउज", "चोली", "लेडीज", "लेडीज सूट", "शरारा", "घरारा", "प्लाजो"
    ],
  },
  {
    category: "Bridal Wear",
    terms: [
      "bridal", "bridal wear", "wedding wear", "wedding lehenga", "bridal lehenga", "shaadi",
      "shadi", "dulhan", "marraige wear", "shaadi ke kapde", "शादी का जोड़ा", "ब्राइडल", "दुल्हन", "शादी"
    ],
  },
  {
    category: "Formal Wear",
    terms: [
      "formal wear", "formal", "office wear", "blazer", "coat pant", "coat", "tuxedo",
      "waistcoat", "formal shirt", "formal pant", "executive wear", "corporate wear",
      "फॉर्मल", "ब्लेज़र", "कोट पैंट", "ऑफिस के कपड़े", "कोट", "वेस्टकोट"
    ],
  },
  {
    category: "Sherwani & Groom",
    terms: [
      "sherwani", "sherwani & groom", "groom", "groom wear", "dulha", "dulhe ke kapde",
      "indo western", "indo-western", "achkan", "jodhpuri", "jodhpuri suit",
      "शेरवानी", "दूल्हा", "अचकन", "जोधपुरी सूट", "इंडो वेस्टर्न"
    ],
  },
  {
    category: "Suit",
    terms: [
      "suit", "suits", "3 piece suit", "2 piece suit", "safari suit", "safari", "business suit",
      "सूट", "सूट सिलवाना", "सफारी सूट", "थ्री पीस सूट", "सूट पैंट"
    ],
  },
  {
    category: "Shirt",
    terms: [
      "shirt", "shirts", "formal shirt", "casual shirt", "linen shirt", "cotton shirt",
      "कमीज", "क़मीज़", "शर्ट", "शर्ट्स"
    ],
  },
  {
    category: "Pants",
    terms: [
      "pants", "pant", "trousers", "trouser", "jeans", "chinos", "formal trousers", "slacks",
      "पैंट", "पतलून", "ट्राउजर", "ट्राउजर्स", "चीनो"
    ],
  },
  {
    category: "Dress",
    terms: [
      "dress", "dresses", "gown", "evening gown", "maxi dress", "one piece", "party dress",
      "ड्रेस", "गाउन", "मैक्सी ड्रेस", "वन पीस"
    ],
  },
  {
    category: "Salwar & Suits",
    terms: [
      "salwar", "salwar suit", "salwar kameez", "patiala", "patiala suit", "churidar",
      "सलवार", "सलवार सूट", "पटियाला सूट", "चूड़ीदार", "सलवार कमीज"
    ],
  },
  {
    category: "Alteration",
    terms: [
      "alteration", "alterations", "alter", "repair", "fit", "fitting", "resize",
      "shorten", "tighten", "loosen", "tight", "loose", "rafa", "hemming", "mending",
      "अल्टरशन", "अल्टर", "कपड़े ठीक", "मरम्मत", "रफू", "फिटिंग", "ढीला करना", "टाइट करना"
    ],
  },
  {
    category: "Uniforms",
    terms: [
      "uniform", "uniforms", "school uniform", "corporate uniform", "hotel uniform", "hospital uniform", "lab coat",
      "वर्दी", "यूनिफॉर्म", "स्कूल यूनिफॉर्म"
    ],
  },
  {
    category: "Kids Wear",
    terms: [
      "kids wear", "kid wear", "children wear", "baby wear", "kids clothing", "bache ke kapde",
      "बच्चों के कपड़े", "किड्स वियर"
    ],
  },
  {
    category: "Winter Wear",
    terms: [
      "winter wear", "overcoat", "wool coat", "jacket", "tweed", "woolen",
      "सर्दियों के कपड़े", "ओवरकोट", "जैकेट"
    ],
  },
  {
    category: "Men's Wear",
    terms: ["men's wear", "mens wear", "gents wear", "men wear", "पुरुषों के कपड़े", "जेंट्स", "पुरुष"],
  },
];

const garmentList = [
  { name: "Bridal Lehenga", terms: ["bridal lehenga", "wedding lehenga", "ब्राइडल लहंगा", "शादी का लहंगा", "दुल्हन का लहंगा"] },
  { name: "Lehenga", terms: ["lehenga", "lehnga", "ghagra", "chaniya choli", "लहंगा", "घाघरा", "चनिया चोली"] },
  { name: "Saree Blouse", terms: ["saree blouse", "blouse", "designer blouse", "ब्लाउज", "चोली"] },
  { name: "Saree", terms: ["saree", "sari", "साड़ी"] },
  { name: "Kurti", terms: ["kurti", "kurta", "कुर्ती", "कुर्ता"] },
  { name: "Salwar Suit", terms: ["salwar suit", "salwar kameez", "salwar", "patiala suit", "सलवार सूट", "सलवार", "पटियाला सूट"] },
  { name: "Anarkali", terms: ["anarkali", "अनारकली"] },
  { name: "Sherwani", terms: ["sherwani", "groom sherwani", "शेरवानी", "दूल्हे की शेरवानी"] },
  { name: "Indo-Western", terms: ["indo-western", "indo western", "achkan", "इंडो वेस्टर्न", "अचकन"] },
  { name: "3-Piece Suit", terms: ["3 piece suit", "3-piece suit", "three piece suit", "थ्री पीस सूट"] },
  { name: "2-Piece Suit", terms: ["2 piece suit", "2-piece suit", "two piece suit", "सूट"] },
  { name: "Blazer", terms: ["blazer", "coat", "sports jacket", "ब्लेज़र", "कोट"] },
  { name: "Tuxedo", terms: ["tuxedo", "tux", "टक्सीडो"] },
  { name: "Formal Shirt", terms: ["formal shirt", "formals shirt", "फॉर्मल शर्ट"] },
  { name: "Shirt", terms: ["shirt", "shirts", "casual shirt", "शर्ट", "कमीज"] },
  { name: "Trousers / Pants", terms: ["pants", "pant", "trousers", "trouser", "chinos", "पैंट", "पतलून", "ट्राउजर"] },
  { name: "Gown / Dress", terms: ["gown", "dress", "evening gown", "maxi dress", "गाउन", "ड्रेस"] },
  { name: "Safari Suit", terms: ["safari suit", "सफारी सूट"] },
  { name: "Uniform", terms: ["school uniform", "uniform", "वर्दी", "यूनिफॉर्म"] },
  { name: "Alteration / Fitting", terms: ["alteration", "alter", "repair", "fitting", "अल्टर", "फिटिंग", "मरम्मत", "रफू"] },
];

const colorTerms = [
  ["black", "काला", "काली", "काले"],
  ["white", "सफेद", "सफ़ेद", "श्वेत"],
  ["blue", "नीला", "नीली", "नीले"],
  ["navy blue", "नेवी ब्लू"],
  ["red", "लाल"],
  ["green", "हरा", "हरी", "हरे"],
  ["yellow", "पीला", "पीली", "पीले"],
  ["pink", "गुलाबी"],
  ["maroon", "मैरून"],
  ["purple", "बैंगनी"],
  ["orange", "नारंगी", "भगवा"],
  ["brown", "भूरा", "भूरी"],
  ["grey", "gray", "ग्रे", "धूसर"],
  ["golden", "gold", "सुनहरा", "सुनहरी"],
  ["silver", "चांदी", "सिल्वर"],
  ["beige", "cream", "क्रीम", "बेज"],
];

const fabricTerms = [
  ["Cotton", "cotton", "सूती", "कॉटन"],
  ["Silk", "silk", "सिल्क", "रेशम"],
  ["Linen", "linen", "लिनेन"],
  ["Khadi", "khadi", "खादी"],
  ["Denim", "denim", "डेनिम"],
  ["Velvet", "velvet", "वेलवेट", "मखमल"],
  ["Chiffon", "chiffon", "शिफॉन"],
  ["Georgette", "georgette", "जॉर्जेट"],
  ["Wool", "woolen", "wool", "ऊनी", "वूल"],
  ["Satin", "satin", "साटन"],
  ["Rayon", "rayon", "रेयॉन"],
  ["Organza", "organza", "ऑर्गेन्ज़ा"],
];

const quantityWords = {
  "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
  "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
  "ek": 1, "do": 2, "teen": 3, "chaar": 4, "paanch": 5, "chhe": 6, "saat": 7, "aath": 8, "nau": 9, "das": 10,
  "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5, "छह": 6, "सात": 7, "आठ": 8, "नौ": 9, "दस": 10,
  "pair": 2, "जोड़ी": 2,
};

function findTerm(text, terms) {
  return terms.find((term) =>
    new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^\\p{L}\\p{M}\\p{N}])`, "iu").test(text)
  );
}

export function parseVoiceRequest(value) {
  const text = String(value || "").trim();
  if (!text) {
    return {
      text: "",
      garment: "",
      category: "",
      color: "",
      fabric: "",
      quantity: 1,
      deadlineDays: null,
      isUrgent: false,
      location: "",
      radiusKm: null,
      summary: "",
    };
  }

  const normalized = text.toLocaleLowerCase();

  // 1. Detect Category
  const categoryRule = categoryRules.find((rule) =>
    rule.terms.some((term) => findTerm(normalized, [term]))
  );

  // 2. Detect Specific Garment
  const garmentMatch = garmentList.find((g) =>
    g.terms.some((term) => findTerm(normalized, [term]))
  );

  // 3. Detect Color
  const colorRule = colorTerms.find((terms) =>
    terms.slice(1).some((term) => findTerm(normalized, [term])) ||
    findTerm(normalized, [terms[0]])
  );

  // 4. Detect Fabric
  const fabricRule = fabricTerms.find((terms) =>
    terms.slice(1).some((term) => findTerm(normalized, [term]))
  );

  // 5. Detect Quantity
  let quantity = 1;
  const numDigitMatch = normalized.match(/(?:qty|quantity|संख्या|मात्रा)?\s*(\d{1,3})\s*(?:piece|pieces|garments?|shirts?|pants?|suits?|नग|पीस)?(?=$|[^a-z0-9])/iu);
  if (numDigitMatch && Number(numDigitMatch[1]) > 0) {
    quantity = Math.min(1000, Number(numDigitMatch[1]));
  } else {
    for (const [word, val] of Object.entries(quantityWords)) {
      if (findTerm(normalized, [word])) {
        quantity = val;
        break;
      }
    }
  }

  // 6. Detect Urgency / Deadline
  let deadlineDays = null;
  let isUrgent = false;

  const urgentMatch = normalized.match(/\b(urgent|urgently|emergency|asap|turant|aaj|today|abhi|तुरंत|इमरजेंसी|आज|अभी|जल्दी)\b/iu);
  const tomorrowMatch = normalized.match(/\b(tomorrow|kal|kal tak|by tomorrow|कल|कल तक)\b/iu);
  const daysMatch = normalized.match(/(?:in|within|by|अगले|के अंदर|तक)?\s*(\d{1,3})\s*(?:days?|din|दिन|روز)(?=$|[^a-z])/iu);
  const weekMatch = normalized.match(/\b(this week|next week|1 week|one week|ek hafte|is hafte|एक हफ्ते|इस हफ्ते|हफ्ते)\b/iu);

  if (urgentMatch) {
    isUrgent = true;
    deadlineDays = 1;
  } else if (tomorrowMatch) {
    deadlineDays = 1;
  } else if (daysMatch) {
    deadlineDays = Math.max(1, Number(daysMatch[1]));
  } else if (weekMatch) {
    deadlineDays = 7;
  }

  // 7. Detect Radius
  const radiusMatch = normalized.match(/(?:within|radius(?: of)?|under|दायरे में|के अंदर|दायरा)?\s*(\d{1,3})\s*(?:km|kilometers?|किलोमीटर|किमी|कीमी)(?=$|[^a-z])/iu);
  const radiusKm = radiusMatch ? Math.min(100, Math.max(1, Number(radiusMatch[1]))) : null;

  // 8. Detect Location
  let location = "";
  const englishPlace = text.match(/\b(?:in|near|around|at)\s+([\p{L}\p{M}0-9\s,.'-]{2,45}?)(?=\s+(?:within|under|radius|for|with|by|urgent|in\s+\d|and|or|और|तथा|तक)\b|[,.;!?]|$)/iu);
  const hindiPlace = text.match(/([\p{L}\p{M}0-9\s,.'-]{2,45}?)\s+(?:में|mein|me|के पास|ke paas|आसपास|aas paas)(?=$|[\s,.!?])/iu);

  if (englishPlace) location = englishPlace[1].trim();
  else if (hindiPlace) location = hindiPlace[1].trim();

  // Clean location if it matched common filler words
  if (/^(?:a |the |my |nearby|urgent|tailor|shop|market|दर्जी|कपड़ा|कपड़े|शर्ट|सूट|जल्दी|दुकान)$/iu.test(location)) {
    location = "";
  }

  // Determine default category if garment was detected without explicit category
  let resolvedCategory = categoryRule?.category || "";
  if (!resolvedCategory && garmentMatch) {
    const garmentName = garmentMatch.name;
    if (["Bridal Lehenga", "Lehenga", "Saree Blouse", "Saree", "Kurti", "Anarkali"].includes(garmentName)) {
      resolvedCategory = "Ethnic Wear";
    } else if (["Salwar Suit"].includes(garmentName)) {
      resolvedCategory = "Salwar & Suits";
    } else if (["Sherwani", "Indo-Western"].includes(garmentName)) {
      resolvedCategory = "Sherwani & Groom";
    } else if (["3-Piece Suit", "2-Piece Suit", "Safari Suit"].includes(garmentName)) {
      resolvedCategory = "Suit";
    } else if (["Blazer", "Tuxedo", "Formal Shirt"].includes(garmentName)) {
      resolvedCategory = "Formal Wear";
    } else if (["Shirt"].includes(garmentName)) {
      resolvedCategory = "Shirt";
    } else if (["Trousers / Pants"].includes(garmentName)) {
      resolvedCategory = "Pants";
    } else if (["Gown / Dress"].includes(garmentName)) {
      resolvedCategory = "Dress";
    } else if (["Alteration / Fitting"].includes(garmentName)) {
      resolvedCategory = "Alteration";
    } else if (["Uniform"].includes(garmentName)) {
      resolvedCategory = "Uniforms";
    }
  }

  // Compose clean summary parts
  const summaryParts = [];
  if (colorRule) summaryParts.push(colorRule[0].toUpperCase());
  if (fabricRule) summaryParts.push(fabricRule[0]);
  if (garmentMatch) summaryParts.push(garmentMatch.name);
  else if (resolvedCategory) summaryParts.push(resolvedCategory);
  if (quantity > 1) summaryParts.push(`(Qty: ${quantity})`);
  if (deadlineDays) summaryParts.push(`⚡ ${deadlineDays} day${deadlineDays > 1 ? "s" : ""}`);
  if (location) summaryParts.push(`📍 ${location}`);
  if (radiusKm) summaryParts.push(`(${radiusKm} km)`);

  return {
    text,
    garment: garmentMatch?.name || "",
    category: resolvedCategory,
    color: colorRule?.[0] || "",
    fabric: fabricRule?.[0] || "",
    quantity,
    deadlineDays,
    isUrgent,
    location,
    radiusKm,
    summary: summaryParts.join(" · ") || text,
  };
}
