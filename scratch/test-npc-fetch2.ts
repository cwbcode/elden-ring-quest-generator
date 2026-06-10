import fs from 'fs';

async function testFetch() {
  const url = `https://eldenring.wiki.gg/api.php?action=query&titles=Needle_Knight_Leda&prop=revisions&rvprop=content&rvslots=main&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = Object.values(data.query.pages) as any[];
  
  for (const page of pages) {
    const wikitext = page.revisions?.[0]?.slots?.main?.['*'] || '';
    console.log(wikitext);
  }
}

testFetch().catch(console.error);
