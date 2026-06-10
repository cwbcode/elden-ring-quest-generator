import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// Reusing routes from app/types.ts
const routes = [
  'armors',
  'ashes',
  'bosses',
  'creatures',
  'incantations',
  'items',
  'locations',
  'npcs',
  'shields',
  'sorceries',
  'spirits',
  'talismans',
  'weapons',
] as const;

type Route = typeof routes[number];

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data', 'sote');

// A mapping to catch Fextralife section titles and map them to our app routes.
function mapFextraSectionToRoute(title: string): Route | null {
  const t = title.toLowerCase();
  
  if (t.includes('bosses')) return 'bosses';
  if (t.includes('npcs')) return 'npcs';
  if (t.includes('locations') || t.includes('dungeons') || t.includes('catacombs') || t.includes('caves') || t.includes('ruins') || t.includes('graves') || t.includes('gaols') || t.includes('villages') || t.includes('shacks') || t.includes('rises') || t.includes('forges')) return 'locations';
  if (t.includes('talismans')) return 'talismans';
  if (t.includes('spirit ashes') || t.includes('revered spirit ash')) return 'spirits';
  if (t.includes('ashes of war')) return 'ashes';
  if (t.includes('incantations') || t.includes('spells')) return 'incantations';
  // Fextralife lists sorceries? Wait, usually spells includes both. Let's map spells to incantations for now, we'll see.
  // Actually, wait, Fextralife has "Shadow of the Erdtree Sorceries" and "Incantations".
  if (t.includes('sorceries')) return 'sorceries';
  
  // Weapons
  if (t.includes('weapons') || t.includes('swords') || t.includes('blades') || t.includes('axes') || t.includes('hammers') || t.includes('bows') || t.includes('staves') || t.includes('seals') || t.includes('daggers') || t.includes('spears') || t.includes('halberds') || t.includes('whips') || t.includes('fists') || t.includes('claws') || t.includes('arts') || t.includes('perfume bottles') || t.includes('thrusting') || t.includes('katanas')) {
     return 'weapons';
  }
  
  if (t.includes('shields')) return 'shields';
  
  // Armors
  if (t.includes('armor') || t.includes('helms') || t.includes('chest') || t.includes('gauntlets') || t.includes('leg') || t.includes('greaves')) {
     return 'armors';
  }
  
  if (t.includes('enemies') || t.includes('creatures')) return 'creatures';
  
  // Items fallback (cookbooks, key items, consumables, materials, larval tears, scadutree fragments)
  if (t.includes('items') || t.includes('cookbooks') || t.includes('materials') || t.includes('consumables') || t.includes('scadutree') || t.includes('larval tear') || t.includes('tools')) {
     return 'items';
  }

  return null;
}

// Ensure the Fextralife link is fully qualified
function getFullUrl(href: string) {
  if (!href) return '';
  if (href.startsWith('http')) return href;
  if (href.startsWith('/')) return `https://eldenring.wiki.fextralife.com${href}`;
  return `https://eldenring.wiki.fextralife.com/${href}`;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function fetchItemPage(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    const name = $('h1').first().text().trim().replace(/ \| Elden Ring Wiki$/i, '') || $('#page-title').text().trim().replace(/ \| Elden Ring Wiki$/i, '');
    
    let imageUrl = $('.infobox img').first().attr('src') || '';
    if (imageUrl && imageUrl.startsWith('/')) {
       imageUrl = 'https://eldenring.wiki.fextralife.com' + imageUrl;
    }

    let description = $('#infobox-custom-description').text().trim() || 
                      $('.infobox .description').text().trim() ||
                      $('blockquote').first().text().trim();
    
    if (!description) {
       const paras = $('#wiki-content-block p').filter((_, el) => $(el).text().trim().length > 20);
       description = paras.first().text().trim();
    }

    let location = '';
    const whereToFindH3 = $('h3, h4').filter((_, el) => $(el).text().toLowerCase().includes('where to find'));
    if (whereToFindH3.length) {
       location = whereToFindH3.nextUntil('h3, h2').text().trim();
    }

    return {
      name,
      imageUrl,
      description: description || 'No description available.',
      location: location || 'Location unknown.'
    };
  } catch (err) {
    console.error(`Error fetching ${url}`, err);
    return null;
  }
}

async function scrapeFextraSOTE() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Fetching Fextralife SOTE hub page...');
  const hubRes = await fetch('https://eldenring.wiki.fextralife.com/Shadow+of+the+Erdtree');
  const hubHtml = await hubRes.text();
  const $ = cheerio.load(hubHtml);

  const headers = $('h3, h4');
  console.log(`Found ${headers.length} headers on the hub page.`);

  const routeLinks: Record<Route, {name: string, url: string}[]> = {
    armors: [],
    ashes: [],
    bosses: [],
    creatures: [],
    incantations: [],
    items: [],
    locations: [],
    npcs: [],
    shields: [],
    sorceries: [],
    spirits: [],
    talismans: [],
    weapons: []
  };

  const seenUrls = new Set<string>();

  headers.each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;

    const route = mapFextraSectionToRoute(text);
    if (!route) return;

    // Find links
    let links = $(el).nextUntil('h3, h4').find('a.wiki_link');
    if (links.length === 0) {
      links = $(el).parent().nextUntil('h3, h4, hr').find('a.wiki_link');
    }
    if (links.length === 0) {
      links = $(el).parent().find('a.wiki_link');
    }

    links.each((_, link) => {
       const href = $(link).attr('href');
       const name = $(link).text().trim();
       if (href && name) {
          const fullUrl = getFullUrl(href);
          if (!seenUrls.has(fullUrl)) {
             seenUrls.add(fullUrl);
             routeLinks[route].push({ name, url: fullUrl });
          }
       }
    });
  });

  const allData: Record<Route, any[]> = {} as any;
  let globalQuestId = 20000;

  for (const route of routes) {
    const itemsToFetch = routeLinks[route];
    console.log(`\nFetching ${itemsToFetch.length} items for route: ${route}...`);
    
    const parsedItems: any[] = [];
    
    // Fetch in small batches to not overwhelm the server
    const batchSize = 5;
    for (let i = 0; i < itemsToFetch.length; i += batchSize) {
       const batch = itemsToFetch.slice(i, i + batchSize);
       const promises = batch.map(async (item) => {
          const data = await fetchItemPage(item.url);
          if (data) {
             globalQuestId++;
             return {
                id: `sote_fextra_${globalQuestId}`,
                name: data.name || item.name,
                image: data.imageUrl,
                description: data.description,
                route: route,
                questId: `sote_${globalQuestId}`,
                location: data.location
             };
          }
          return null;
       });

       const results = await Promise.all(promises);
       results.forEach(res => { if (res) parsedItems.push(res); });
       
       await delay(200); // 200ms delay between batches
    }

    console.log(`Successfully parsed ${parsedItems.length} items for ${route}.`);
    allData[route] = parsedItems;
    fs.writeFileSync(path.join(OUTPUT_DIR, `${route}.json`), JSON.stringify(parsedItems, null, 2));
  }
  
  // Write index/manifest
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify({
    source: 'https://eldenring.wiki.fextralife.com/Shadow+of+the+Erdtree',
    timestamp: new Date().toISOString(),
    routes: Object.keys(allData),
    counts: Object.fromEntries(Object.entries(allData).map(([k, v]) => [k, v.length]))
  }, null, 2));

  console.log('\nSOTE Data generation complete.');
  console.log('Validating output...');
  
  let total = 0;
  for (const route of routes) {
    total += allData[route]?.length || 0;
  }
  if (total === 0) {
    console.error("VALIDATION FAILED: No data was generated. Something is wrong with the parsing.");
    process.exit(1);
  }
  console.log(`VALIDATION PASSED: ${total} total SOTE items generated.`);
}

scrapeFextraSOTE().catch(err => {
  console.error("Generator failed:", err);
  process.exit(1);
});
