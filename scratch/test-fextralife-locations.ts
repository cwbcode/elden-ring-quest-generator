import * as cheerio from 'cheerio';

async function main() {
  const res = await fetch('https://eldenring.wiki.fextralife.com/Shadow+of+the+Erdtree');
  const html = await res.text();
  const $ = cheerio.load(html);

  const headers = $('h3, h4');

  headers.each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;
    const lower = text.toLowerCase();
    
    // Check if it might be a location
    if (lower.includes('location') || lower.includes('dungeon') || lower.includes('catacomb') || lower.includes('cave') || lower.includes('ruin') || lower.includes('grave') || lower.includes('gaol')) {
      console.log(`\n=== Section: ${text} ===`);
      let links = $(el).nextUntil('h3, h4').find('a.wiki_link');
      if (links.length === 0) links = $(el).parent().nextUntil('h3, h4, hr').find('a.wiki_link');
      if (links.length === 0) links = $(el).parent().find('a.wiki_link');

      links.each((_, link) => {
         const href = $(link).attr('href');
         const name = $(link).text().trim();
         if (href && name) console.log(` - ${name}: ${href}`);
      });
    }
  });
}

main().catch(console.error);
