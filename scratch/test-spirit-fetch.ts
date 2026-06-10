import fs from 'fs';

async function testFetch() {
  const url = `https://eldenring.wiki.gg/api.php?action=query&titles=Black_Knight_Commander_Andreas&prop=categories&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = Object.values(data.query.pages) as any[];
  
  for (const page of pages) {
    const categories = page.categories?.map((c: any) => c.title) || [];
    console.log("Categories:", categories);
  }
}

testFetch().catch(console.error);
