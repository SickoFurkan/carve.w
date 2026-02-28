interface CitySuggestion {
  title: string
  description: string
  time_slot: "morning" | "afternoon" | "evening"
  location_name: string
  estimated_cost: number
  cost_category: "food" | "activity" | "transport" | "shopping" | "other"
  duration_minutes: number
}

const CITY_DATA: Record<string, CitySuggestion[]> = {
  barcelona: [
    { title: "La Sagrada Familia", description: "Gaudí's iconic basilica — book tickets in advance to skip the line", time_slot: "morning", location_name: "Carrer de Mallorca, 401", estimated_cost: 26, cost_category: "activity", duration_minutes: 90 },
    { title: "La Boqueria Market", description: "Wander through the famous food market and grab fresh juice and tapas", time_slot: "morning", location_name: "La Rambla, 91", estimated_cost: 15, cost_category: "food", duration_minutes: 60 },
    { title: "Park Güell", description: "Gaudí's colorful mosaic park with panoramic city views", time_slot: "afternoon", location_name: "Carrer d'Olot", estimated_cost: 10, cost_category: "activity", duration_minutes: 120 },
    { title: "Gothic Quarter Walk", description: "Get lost in the narrow medieval streets of Barri Gòtic", time_slot: "afternoon", location_name: "Barri Gòtic", estimated_cost: 0, cost_category: "activity", duration_minutes: 90 },
    { title: "Barceloneta Beach", description: "Relax at the city beach or grab seafood at a chiringuito", time_slot: "afternoon", location_name: "Platja de la Barceloneta", estimated_cost: 0, cost_category: "activity", duration_minutes: 120 },
    { title: "Tapas at El Xampanyet", description: "Traditional cava bar with some of the best tapas in Born", time_slot: "evening", location_name: "Carrer de Montcada, 22", estimated_cost: 25, cost_category: "food", duration_minutes: 90 },
    { title: "Bunkers del Carmel", description: "Best sunset viewpoint in Barcelona — bring drinks and snacks", time_slot: "evening", location_name: "Turó de la Rovira", estimated_cost: 5, cost_category: "activity", duration_minutes: 60 },
    { title: "Casa Batlló Night Visit", description: "Gaudí's masterpiece lit up at night with a rooftop experience", time_slot: "evening", location_name: "Passeig de Gràcia, 43", estimated_cost: 39, cost_category: "activity", duration_minutes: 75 },
  ],
  paris: [
    { title: "Eiffel Tower", description: "Take the stairs to the second floor for the best views and less waiting", time_slot: "morning", location_name: "Champ de Mars", estimated_cost: 29, cost_category: "activity", duration_minutes: 120 },
    { title: "Croissant at Du Pain et des Idées", description: "Best bakery in Paris — try the pain des amis and escargot pastry", time_slot: "morning", location_name: "34 Rue Yves Toudic", estimated_cost: 8, cost_category: "food", duration_minutes: 30 },
    { title: "Louvre Museum", description: "Focus on one wing to avoid burnout — Denon wing has the Mona Lisa", time_slot: "afternoon", location_name: "Rue de Rivoli", estimated_cost: 22, cost_category: "activity", duration_minutes: 180 },
    { title: "Le Marais Walk", description: "Trendy neighborhood with vintage shops, falafel, and hidden courtyards", time_slot: "afternoon", location_name: "Le Marais", estimated_cost: 0, cost_category: "activity", duration_minutes: 90 },
    { title: "Seine River Walk", description: "Walk along the Left Bank from Notre-Dame to Musée d'Orsay", time_slot: "afternoon", location_name: "Quai de la Tournelle", estimated_cost: 0, cost_category: "activity", duration_minutes: 60 },
    { title: "Dinner at Le Bouillon Chartier", description: "Classic Parisian brasserie with incredible prices — expect a queue", time_slot: "evening", location_name: "7 Rue du Faubourg Montmartre", estimated_cost: 18, cost_category: "food", duration_minutes: 75 },
    { title: "Montmartre & Sacré-Cœur", description: "Climb to the basilica for sunset views, then explore the artists' quarter", time_slot: "evening", location_name: "Montmartre", estimated_cost: 0, cost_category: "activity", duration_minutes: 90 },
    { title: "Jazz at Le Caveau de la Huchette", description: "Legendary jazz club in a medieval cellar — live music every night", time_slot: "evening", location_name: "5 Rue de la Huchette", estimated_cost: 15, cost_category: "activity", duration_minutes: 120 },
  ],
  rome: [
    { title: "Colosseum & Roman Forum", description: "Book the combined ticket — arrive early for fewer crowds", time_slot: "morning", location_name: "Piazza del Colosseo", estimated_cost: 18, cost_category: "activity", duration_minutes: 150 },
    { title: "Coffee at Sant'Eustachio", description: "Best espresso in Rome — order the gran caffè and drink it at the bar", time_slot: "morning", location_name: "Piazza di Sant'Eustachio, 82", estimated_cost: 3, cost_category: "food", duration_minutes: 20 },
    { title: "Trastevere Lunch", description: "Cross the river for authentic Roman cuisine in this charming neighborhood", time_slot: "afternoon", location_name: "Trastevere", estimated_cost: 15, cost_category: "food", duration_minutes: 75 },
    { title: "Vatican Museums & Sistine Chapel", description: "Book skip-the-line tickets — go on Wednesday for smaller crowds", time_slot: "afternoon", location_name: "Viale Vaticano", estimated_cost: 20, cost_category: "activity", duration_minutes: 180 },
    { title: "Trevi Fountain", description: "Throw a coin and make a wish — visit at dawn for photos without crowds", time_slot: "afternoon", location_name: "Piazza di Trevi", estimated_cost: 0, cost_category: "activity", duration_minutes: 30 },
    { title: "Aperitivo at Salotto 42", description: "Stylish cocktail bar near the Pantheon with generous aperitivo buffet", time_slot: "evening", location_name: "Piazza di Pietra, 42", estimated_cost: 12, cost_category: "food", duration_minutes: 60 },
    { title: "Piazza Navona at Night", description: "Stroll through this stunning baroque square with Bernini's fountains lit up", time_slot: "evening", location_name: "Piazza Navona", estimated_cost: 0, cost_category: "activity", duration_minutes: 45 },
    { title: "Gelato at Giolitti", description: "Rome's oldest gelateria since 1900 — try the pistachio and crema", time_slot: "evening", location_name: "Via degli Uffici del Vicario, 40", estimated_cost: 4, cost_category: "food", duration_minutes: 20 },
  ],
  amsterdam: [
    { title: "Anne Frank House", description: "Book tickets exactly 6 weeks in advance — they sell out fast", time_slot: "morning", location_name: "Prinsengracht 263-267", estimated_cost: 16, cost_category: "activity", duration_minutes: 75 },
    { title: "Canal Bike Ride", description: "Rent a bike and ride along the Herengracht and Keizersgracht canals", time_slot: "morning", location_name: "Central Amsterdam", estimated_cost: 12, cost_category: "transport", duration_minutes: 90 },
    { title: "Rijksmuseum", description: "See Rembrandt's Night Watch and Vermeer's Milkmaid — allow plenty of time", time_slot: "afternoon", location_name: "Museumstraat 1", estimated_cost: 22, cost_category: "activity", duration_minutes: 150 },
    { title: "Jordaan Neighborhood", description: "Boutique shops, cozy cafés, and the best apple pie at Winkel 43", time_slot: "afternoon", location_name: "Jordaan", estimated_cost: 8, cost_category: "food", duration_minutes: 90 },
    { title: "Vondelpark", description: "Amsterdam's green heart — grab a coffee and people-watch", time_slot: "afternoon", location_name: "Vondelpark", estimated_cost: 0, cost_category: "activity", duration_minutes: 60 },
    { title: "Indonesian Rijsttafel", description: "Colonial-era multi-dish feast — try Kantjil & de Tijger for good value", time_slot: "evening", location_name: "Spuistraat 291-293", estimated_cost: 28, cost_category: "food", duration_minutes: 90 },
    { title: "Canal Cruise at Sunset", description: "Open-boat canal tour through the UNESCO heritage canals", time_slot: "evening", location_name: "Stadhouderskade", estimated_cost: 18, cost_category: "activity", duration_minutes: 75 },
    { title: "Paradiso Live Music", description: "Legendary concert venue in a former church — check the schedule", time_slot: "evening", location_name: "Weteringschans 6-8", estimated_cost: 20, cost_category: "activity", duration_minutes: 120 },
  ],
  london: [
    { title: "British Museum", description: "Free entry — see the Rosetta Stone and Parthenon sculptures", time_slot: "morning", location_name: "Great Russell Street", estimated_cost: 0, cost_category: "activity", duration_minutes: 150 },
    { title: "Full English at The Regency Café", description: "Iconic greasy spoon with classic British breakfast — cash only", time_slot: "morning", location_name: "17-19 Regency Street", estimated_cost: 10, cost_category: "food", duration_minutes: 45 },
    { title: "Tower of London", description: "See the Crown Jewels and Yeoman Warder tours — book ahead", time_slot: "afternoon", location_name: "Tower Hill", estimated_cost: 33, cost_category: "activity", duration_minutes: 150 },
    { title: "Borough Market", description: "London's best food market — try the grilled cheese at Kappacasein", time_slot: "afternoon", location_name: "8 Southwark Street", estimated_cost: 15, cost_category: "food", duration_minutes: 75 },
    { title: "South Bank Walk", description: "Walk from Tate Modern to the London Eye along the Thames", time_slot: "afternoon", location_name: "South Bank", estimated_cost: 0, cost_category: "activity", duration_minutes: 60 },
    { title: "Pub Dinner at The Churchill Arms", description: "Famous flower-covered pub in Kensington with Thai food upstairs", time_slot: "evening", location_name: "119 Kensington Church Street", estimated_cost: 14, cost_category: "food", duration_minutes: 75 },
    { title: "West End Show", description: "Grab last-minute tickets at TKTS booth in Leicester Square", time_slot: "evening", location_name: "Leicester Square", estimated_cost: 35, cost_category: "activity", duration_minutes: 150 },
    { title: "Sky Garden", description: "Free rooftop garden with panoramic views — book the free slot online", time_slot: "evening", location_name: "20 Fenchurch Street", estimated_cost: 0, cost_category: "activity", duration_minutes: 60 },
  ],
  tokyo: [
    { title: "Tsukiji Outer Market", description: "Fresh sushi breakfast and street food — try tamagoyaki on a stick", time_slot: "morning", location_name: "Tsukiji 4-chome", estimated_cost: 15, cost_category: "food", duration_minutes: 90 },
    { title: "Senso-ji Temple", description: "Tokyo's oldest temple — walk through the Kaminarimon gate at dawn", time_slot: "morning", location_name: "2-3-1 Asakusa", estimated_cost: 0, cost_category: "activity", duration_minutes: 60 },
    { title: "Shibuya Crossing", description: "World's busiest intersection — watch from the Starbucks above", time_slot: "afternoon", location_name: "Shibuya", estimated_cost: 5, cost_category: "activity", duration_minutes: 30 },
    { title: "Meiji Shrine", description: "Peaceful forested shrine in the heart of Harajuku", time_slot: "afternoon", location_name: "1-1 Yoyogikamizonocho", estimated_cost: 0, cost_category: "activity", duration_minutes: 60 },
    { title: "Harajuku & Takeshita Street", description: "Youth culture, crepes, and wild fashion — perfect for people-watching", time_slot: "afternoon", location_name: "Takeshita Street", estimated_cost: 10, cost_category: "shopping", duration_minutes: 90 },
    { title: "Ramen at Fuunji", description: "Legendary tsukemen (dipping ramen) spot — expect a short queue", time_slot: "evening", location_name: "Yoyogi, Shibuya", estimated_cost: 10, cost_category: "food", duration_minutes: 45 },
    { title: "Golden Gai", description: "Tiny 6-seat bars packed into narrow alleys — incredible atmosphere", time_slot: "evening", location_name: "Shinjuku Golden Gai", estimated_cost: 15, cost_category: "food", duration_minutes: 90 },
    { title: "Tokyo Tower at Night", description: "Classic Tokyo landmark lit up — quieter than Skytree with great views", time_slot: "evening", location_name: "4-2-8 Shibakoen", estimated_cost: 12, cost_category: "activity", duration_minutes: 60 },
  ],
  istanbul: [
    { title: "Hagia Sophia", description: "Stunning Byzantine-Ottoman hybrid — arrive at opening for smaller crowds", time_slot: "morning", location_name: "Sultan Ahmet, Ayasofya Meydanı", estimated_cost: 25, cost_category: "activity", duration_minutes: 90 },
    { title: "Turkish Breakfast at Van Kahvaltı Evi", description: "Massive spread with honey, cheese, eggs, and endless çay", time_slot: "morning", location_name: "Kılıçali Paşa, Defterdar Ykş. 52", estimated_cost: 12, cost_category: "food", duration_minutes: 75 },
    { title: "Grand Bazaar", description: "One of the world's oldest covered markets — haggle for ceramics and lamps", time_slot: "afternoon", location_name: "Beyazıt, Kalpakçılar Cd.", estimated_cost: 0, cost_category: "shopping", duration_minutes: 120 },
    { title: "Bosphorus Ferry", description: "Take the public ferry from Eminönü — cheapest way to cruise the strait", time_slot: "afternoon", location_name: "Eminönü Ferry Terminal", estimated_cost: 3, cost_category: "transport", duration_minutes: 90 },
    { title: "Spice Bazaar", description: "Aromatic market with Turkish delight, spices, and dried fruits", time_slot: "afternoon", location_name: "Rüstem Paşa, Erzak Ambarı Sok.", estimated_cost: 10, cost_category: "shopping", duration_minutes: 45 },
    { title: "Rooftop Dinner in Sultanahmet", description: "Eat kebabs with views of the Blue Mosque lit up at night", time_slot: "evening", location_name: "Sultanahmet", estimated_cost: 20, cost_category: "food", duration_minutes: 90 },
    { title: "Hammam at Kılıç Ali Paşa", description: "Beautifully restored 16th century bathhouse — book the traditional scrub", time_slot: "evening", location_name: "Kemankeş Karamustafa Paşa", estimated_cost: 50, cost_category: "activity", duration_minutes: 90 },
    { title: "İstiklal Avenue & Galata Tower", description: "Walk the buzzing pedestrian street and climb the medieval tower for views", time_slot: "evening", location_name: "Beyoğlu", estimated_cost: 10, cost_category: "activity", duration_minutes: 75 },
  ],
  lisbon: [
    { title: "Pastéis de Belém", description: "The original custard tart bakery since 1837 — order extra cinnamon", time_slot: "morning", location_name: "Rua de Belém 84-92", estimated_cost: 5, cost_category: "food", duration_minutes: 30 },
    { title: "Tram 28 to Alfama", description: "Iconic yellow tram through the oldest neighborhood — sit by the window", time_slot: "morning", location_name: "Largo Martim Moniz", estimated_cost: 3, cost_category: "transport", duration_minutes: 45 },
    { title: "Castelo de São Jorge", description: "Moorish castle with the best panoramic views of Lisbon", time_slot: "afternoon", location_name: "Rua de Santa Cruz do Castelo", estimated_cost: 15, cost_category: "activity", duration_minutes: 90 },
    { title: "Time Out Market", description: "Lisbon's food hall with the city's best chefs under one roof", time_slot: "afternoon", location_name: "Av. 24 de Julho 49", estimated_cost: 18, cost_category: "food", duration_minutes: 75 },
    { title: "LX Factory", description: "Creative hub in a former industrial complex — bookshop, street art, brunch", time_slot: "afternoon", location_name: "Rua Rodrigues de Faria 103", estimated_cost: 0, cost_category: "activity", duration_minutes: 90 },
    { title: "Sunset at Miradouro da Graça", description: "Locals' favorite viewpoint — grab a beer from the kiosk and watch the sunset", time_slot: "evening", location_name: "Largo da Graça", estimated_cost: 4, cost_category: "food", duration_minutes: 60 },
    { title: "Fado in Alfama", description: "Listen to traditional Portuguese soul music in an intimate tasca", time_slot: "evening", location_name: "Alfama", estimated_cost: 25, cost_category: "activity", duration_minutes: 90 },
    { title: "Ginjinha Shot at A Ginjinha", description: "Tiny bar serving cherry liqueur since 1840 — one shot is tradition", time_slot: "evening", location_name: "Largo de São Domingos 8", estimated_cost: 2, cost_category: "food", duration_minutes: 10 },
  ],
}

// Normalize city name for matching
function normalizeCity(destination: string): string {
  return destination
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim()
}

export function getSuggestionsForDestination(destination: string): CitySuggestion[] {
  const normalized = normalizeCity(destination)

  // Direct match
  for (const [city, suggestions] of Object.entries(CITY_DATA)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return suggestions
    }
  }

  return []
}

export function getSupportedCities(): string[] {
  return Object.keys(CITY_DATA).map((c) => c.charAt(0).toUpperCase() + c.slice(1))
}

export type { CitySuggestion }
