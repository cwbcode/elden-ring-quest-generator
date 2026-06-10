import fs from 'fs';

async function testFetch() {
  const url = `https://eldenring.wiki.gg/api.php?action=query&titles=Needle_Knight_Leda&prop=revisions|extracts|categories&rvprop=content&rvslots=main&exintro=1&explaintext=1&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = Object.values(data.query.pages) as any[];
  
  for (const page of pages) {
    const wikitext = page.revisions?.[0]?.slots?.main?.['*'] || '';
    const extract = page.extract || '';
    const categories = page.categories?.map((c: any) => c.title) || [];
    console.log("Categories:", categories);
    console.log("Extract includes DLC?:", extract.toLowerCase().includes('shadow of the erdtree'));
    console.log("Wikitext dlc=?:", !!wikitext.match(/dlc\s*=\s*(?:Shadow of the Erdtree|SotE)/i));
    console.log("Wikitext {{SotE}}?:", !!wikitext.match(/\{\{SotE\}\}/i));
    console.log("Extract:", extract);
  }
}

testFetch().catch(console.error);
