import type { JournalResponse } from '../types'

/**
 * A pre-written SAMPLE used only for the landing-page preview and the "open sample" demo.
 * Every journal a user creates comes from a real Gemini call on the backend.
 */
export const SAMPLE: JournalResponse = {
  trip: { destination: 'Kyoto', days: 3, travel_dates: 'November', interests: ['Culture', 'Food', 'Photography'], travel_style: 'Slow & relaxed' },
  meta: { model: 'sample', generated_at: '2026-01-01T00:00:00Z' },
  journal: {
    title: 'Slow Mornings in Old Kyoto',
    destination: 'Kyoto',
    country: 'Japan',
    subtitle: 'Temples, tea and lantern-lit lanes in three unhurried days',
    intro:
      'For over a thousand years Kyoto was Japan’s imperial capital, and it still keeps time differently. Wooden machiya houses line narrow lanes, bamboo hums in the wind, and temple bells mark the hours. Walk early, linger over tea, and let the city reveal itself in small doorways.',
    editorial: 'A city built for wandering: quiet shrines at sunrise, bustling markets by noon, geisha districts glowing at dusk.',
    facts: [
      'Kyoto has around 1,600 Buddhist temples and 400 Shinto shrines.',
      'The city was deliberately spared from bombing in the Second World War.',
      'Autumn leaves, momiji, usually peak in late November.',
      'Matcha and tofu cuisine grew out of temple kitchens.',
    ],
    places: [
      { name: 'Fushimi Inari Shrine', kind: 'temple', area: 'Fushimi', description: 'Thousands of vermilion torii gates wind up a forested hillside. Go early for quiet light and fewer crowds.', note: 'start at sunrise!', needs_verification: false },
      { name: 'Kinkaku-ji', kind: 'temple', area: 'Kita', description: 'The Golden Pavilion shimmers above a mirror pond; a classic Zen garden walk follows the shoreline.', note: 'so shiny', needs_verification: false },
      { name: 'Arashiyama Bamboo Grove', kind: 'nature', area: 'Arashiyama', description: 'A path through towering bamboo that sways and whispers; pair it with the nearby Tenryu-ji gardens.', note: 'listen closely', needs_verification: false },
      { name: 'Nishiki Market', kind: 'market', area: 'Central Kyoto', description: 'Kyoto’s kitchen: a covered lane of pickles, tofu, sweets and street snacks to graze through.', note: 'come hungry', needs_verification: false },
      { name: 'Gion District', kind: 'neighbourhood', area: 'Higashiyama', description: 'Wooden teahouses and lantern-lit lanes; respectful evening wandering may reward you with a glimpse of a maiko.', note: 'be discreet', needs_verification: false },
      { name: 'Philosopher’s Path', kind: 'street', area: 'Sakyo', description: 'A canal-side stroll lined with cherry trees, small cafés and quiet temples leading to Ginkaku-ji.', note: 'slow walk', needs_verification: false },
      { name: 'Kiyomizu-dera', kind: 'temple', area: 'Higashiyama', description: 'A wooden stage juts from the hillside with sweeping city views, reached through lively old lanes.', note: 'views for days', needs_verification: false },
      { name: 'Nanzen-ji Aqueduct', kind: 'bridge', area: 'Sakyo', description: 'A red-brick Meiji-era aqueduct cutting through a Zen temple precinct; wonderfully photogenic.', note: 'hidden-ish gem', needs_verification: true },
    ],
    food: [
      { name: 'Kaiseki dinner', category: 'experience', area: 'Gion', description: 'A multi-course seasonal tasting menu, Kyoto’s haute cuisine; book a modest, lunchtime version.', note: 'dress nicely', needs_verification: false },
      { name: 'Matcha parfait', category: 'cafe', area: 'Uji / Central', description: 'Green-tea ice cream, mochi and sweet beans in a tall glass; a Kyoto rite of passage.', note: 'obsessed', needs_verification: false },
      { name: 'Yudofu', category: 'dish', area: 'Nanzen-ji', description: 'Silky tofu simmered in kombu broth, a calm, temple-born meal.', note: 'so gentle', needs_verification: false },
      { name: 'Tsukemono pickles', category: 'dish', area: 'Nishiki Market', description: 'Regional pickled vegetables, crisp and sharp, perfect with rice and tea.', note: 'try everything', needs_verification: false },
      { name: 'Local kissaten coffee', category: 'cafe', area: 'Central Kyoto', description: 'Old-school coffeehouses with hand-poured brews, toast sets and plenty of nostalgia.', note: 'morning ritual', needs_verification: true },
      { name: 'Ramen in a tiny shop', category: 'restaurant', area: 'Kawaramachi', description: 'Rich, chicken-based Kyoto-style ramen is a comforting late-night option.', note: 'slurp loudly', needs_verification: true },
      { name: 'Wagashi workshop', category: 'experience', area: 'Higashiyama', description: 'Learn to shape seasonal sweets and enjoy them with whisked tea.', note: 'edible art', needs_verification: true },
    ],
    stay_areas: [
      { name: 'Gion & Higashiyama', vibe: 'Old Kyoto, lantern-lit', why: 'Walk to temples and teahouses after the day-trippers leave; atmospheric but busy in peak season.', best_for: 'First-timers, atmosphere' },
      { name: 'Kyoto Station area', vibe: 'Practical and connected', why: 'Trains and buses to everywhere, including day trips; less charm, maximum convenience.', best_for: 'Short stays, rail travel' },
      { name: 'Kawaramachi', vibe: 'Lively, central', why: 'Food, shopping and nightlife on your doorstep with easy walking to Gion and Nishiki.', best_for: 'Foodies, night owls' },
    ],
    stays: [
      { name: 'A renovated machiya townhouse', area: 'Higashiyama', style: 'traditional stay', description: 'Tatami floors and a private garden in a restored wooden house; check recent reviews.', needs_verification: true },
      { name: 'A design-forward boutique hotel', area: 'Kawaramachi', style: 'boutique hotel', description: 'Calm minimalist rooms close to restaurants and the river.', needs_verification: true },
    ],
    stay_notes: 'Book early for autumn and cherry-blossom weeks, and choose somewhere near a subway or train line.',
    route: {
      summary: 'Start east with the big shrines, drift north to the gardens, then spend the last day west and in the market.',
      order: ['Fushimi Inari Shrine', 'Kiyomizu-dera', 'Gion District', 'Nanzen-ji Aqueduct', 'Philosopher’s Path', 'Kinkaku-ji', 'Arashiyama Bamboo Grove', 'Nishiki Market'],
      clusters: [
        { name: 'Eastern Kyoto', places: ['Kiyomizu-dera', 'Gion District', 'Philosopher’s Path'], note: 'walkable temples' },
        { name: 'Northwest', places: ['Kinkaku-ji', 'Arashiyama Bamboo Grove'], note: 'gardens and bamboo' },
        { name: 'Central', places: ['Nishiki Market'], note: 'food crawl' },
      ],
    },
    days: [
      { day: 1, title: 'Gates, Hills & Lanterns', area: 'Fushimi & Higashiyama', intro: 'Beat the crowds at the torii gates, then climb into old Kyoto.',
        stops: [
          { part: 'Morning', place: 'Fushimi Inari Shrine', activity: 'Hike the gate-lined path as far as feels right, with a tea stop halfway.' },
          { part: 'Afternoon', place: 'Kiyomizu-dera', activity: 'Wander the old lanes up to the wooden stage and its sweeping views.' },
          { part: 'Evening', place: 'Gion District', activity: 'Stroll the lantern-lit lanes and settle in for a long dinner.' },
        ], food_stop: { name: 'Kaiseki dinner', note: 'a slow, seasonal feast' }, caption: 'Red gates, tired legs, happiest I’ve been all year.' },
      { day: 2, title: 'Water, Gardens & Gold', area: 'Sakyo & Kita', intro: 'A day of canals, quiet gardens and a shimmering pavilion.',
        stops: [
          { part: 'Morning', place: 'Nanzen-ji Aqueduct', activity: 'Photograph the red-brick arches before the tour groups arrive.' },
          { part: 'Midday', place: 'Philosopher’s Path', activity: 'Walk the canal slowly, stopping at a café or two.' },
          { part: 'Afternoon', place: 'Kinkaku-ji', activity: 'See the Golden Pavilion reflected in its pond, then walk the garden loop.' },
        ], food_stop: { name: 'Yudofu lunch', note: 'tofu in warm broth' }, caption: 'Gold on water, quiet in my head.' },
      { day: 3, title: 'Bamboo & Market Bites', area: 'Arashiyama & Central', intro: 'Greenery in the morning, grazing through town by afternoon.',
        stops: [
          { part: 'Morning', place: 'Arashiyama Bamboo Grove', activity: 'Walk the grove early, then visit the neighbouring temple gardens.' },
          { part: 'Afternoon', place: 'Nishiki Market', activity: 'Graze stall to stall on pickles, tofu doughnuts and sweets.' },
          { part: 'Evening', place: 'Kawaramachi riverside', activity: 'Sit by the Kamo River and watch the city wind down.' },
        ], food_stop: { name: 'Matcha parfait', note: 'dessert first, always' }, caption: 'Bamboo whispers, pocket full of pickles.' },
    ],
    tips: [
      'Buses can be crowded; a rechargeable IC card makes buses and trains easy.',
      'Start temples early: mornings are calmer and photos are better.',
      'Carry some cash; smaller shops and stalls may not take cards.',
      'Wear shoes that slip on and off easily for temples and restaurants.',
      'Book kaiseki and popular spots ahead where you can.',
    ],
    customs: [
      'Remove shoes where asked, and stay quiet in sacred spaces.',
      'Never photograph geiko or maiko without permission.',
      'Do not eat while walking in busy lanes; stand by the stall instead.',
      'Do not leave chopsticks standing upright in rice.',
    ],
    useful_info: [
      'Trains and subways cover most sights; buses fill the gaps.',
      'Convenience stores are handy for snacks, cash and tickets.',
      'Check temple hours and seasonal closures before you go.',
    ],
    packing: ['Comfy walking shoes', 'Light rain jacket', 'Small coin purse', 'Portable charger', 'Reusable water bottle', 'Layers for evenings', 'Compact umbrella', 'Camera + spare card'],
    annotations: ['go before the crowds!', 'tea first, plans later', 'so many stairs', 'sleep well, wander far', 'quiet is the luxury'],
    disclaimer: 'This is an AI-written sample. It uses no live data: please verify opening hours, prices and availability before you travel.',
  },
}
