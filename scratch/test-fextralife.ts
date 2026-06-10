import * as cheerio from 'cheerio';

async function main() {
  console.log('Fetching hub page...');
  const res = await fetch('https://eldenring.wiki.fextralife.com/Shadow+of+the+Erdtree');
  const html = await res.text();
  const $ = cheerio.load(html);

  // Fextralife uses a lot of messy HTML. We need to find headings like "Bosses", "Weapons", etc.
  // And under them, usually there are divs with class "row" containing links.
  
  const headers = $('h3, h4');
  console.log(`Found ${headers.length} headers`);

  headers.each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;

    // Check if it's one of our target categories
    const targetCategories = ['bosses', 'npcs', 'enemies', 'locations', 'weapons', 'armor', 'spells', 'incantations', 'talismans', 'ashes of war', 'spirit ashes', 'cookbooks', 'key items', 'consumables', 'materials', 'quests'];
    
    if (targetCategories.some(cat => text.toLowerCase().includes(cat))) {
      console.log(`\n=== Section: ${text} ===`);
      
      // Let's find the next sibling element that contains links, or the parent container.
      // Often Fextralife uses `<h3 class="special">` and then a `div.row` or similar.
      let links = $(el).nextUntil('h3, h4').find('a.wiki_link');
      if (links.length === 0) {
        // sometimes the h3 is inside a div, so we search the parent's next siblings
        links = $(el).parent().nextUntil('h3, h4, hr').find('a.wiki_link');
      }
      
      if (links.length === 0) {
         // Maybe just all links in the same container?
         links = $(el).parent().find('a.wiki_link');
      }

      console.log(`Found ${links.length} links`);
      let count = 0;
      links.each((_, link) => {
         const href = $(link).attr('href');
         const name = $(link).text().trim();
         if (href && name && count < 3) {
            console.log(` - ${name}: ${href}`);
            count++;
         }
      });
    }
  });
}

main().catch(console.error);
