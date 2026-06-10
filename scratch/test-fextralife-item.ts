import * as cheerio from 'cheerio';

async function testItem(url: string) {
  console.log(`Fetching ${url}...`);
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const name = $('h1').first().text().trim() || $('#page-title').text().trim();
  
  // Fextralife often has an infobox on the right side
  let imageUrl = $('.infobox img').first().attr('src');
  if (imageUrl && imageUrl.startsWith('/')) {
     imageUrl = 'https://eldenring.wiki.fextralife.com' + imageUrl;
  }

  // Description is usually the first paragraph or blockquote under the infobox or intro
  let description = $('#infobox-custom-description').text().trim() || 
                    $('.infobox .description').text().trim() ||
                    $('blockquote').first().text().trim();
  
  if (!description) {
     const paras = $('#wiki-content-block p').filter((_, el) => $(el).text().trim().length > 20);
     description = paras.first().text().trim();
  }

  // Location/Acquisition
  let location = '';
  const whereToFindH3 = $('h3').filter((_, el) => $(el).text().toLowerCase().includes('where to find'));
  if (whereToFindH3.length) {
     location = whereToFindH3.nextUntil('h3, h2').text().trim();
  }

  console.log({
    name,
    imageUrl,
    description: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
    location: location.substring(0, 100) + (location.length > 100 ? '...' : '')
  });
}

async function run() {
  await testItem('https://eldenring.wiki.fextralife.com/Blackgaol+Knight');
  await testItem('https://eldenring.wiki.fextralife.com/Death+Knight');
  await testItem('https://eldenring.wiki.fextralife.com/Anvil+Hammer');
  await testItem('https://eldenring.wiki.fextralife.com/Dryleaf+Dane');
}

run().catch(console.error);
