import { IdListItem, routes } from "./types";

const soteCategories: Record<string, string> = {
  'bosses': 'Category:Bosses',
  'locations': 'Category:Locations',
  'items': 'Category:Items',
  'npcs': 'Category:NPCs',
  'weapons': 'Category:Weapons',
  'talismans': 'Category:Talismans',
  'incantations': 'Category:Incantations',
  'sorceries': 'Category:Sorceries',
  'shields': 'Category:Shields',
  'ashes': 'Category:Ashes_of_War',
  'spirits': 'Category:Spirit_Ashes',
  'armors': 'Category:Armor',
  'creatures': 'Category:Creatures'
};

export async function scrapeSoteAPI(): Promise<Array<IdListItem>> {
  const soteList: Array<IdListItem> = [];
  let questId = 10000; // Offset conceptually, though completely isolated in storage
  
  // Rate limits on wiki.gg can silently reject bulk fetch attempts.
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  for (const route of routes) {
    const categoryName = soteCategories[route];
    if (!categoryName) continue;
    
    let gcmcontinue = "";
    let fetched = 0;
    
    try {
      while (fetched < 500) {
        await delay(600); // 600ms spacing between requests prevents 429 Errors
        
        const url = `https://eldenring.wiki.gg/api.php?action=query&generator=categorymembers&gcmtitle=${categoryName}&gcmnamespace=0&gcmlimit=50&prop=revisions|extracts&rvprop=content&rvslots=main&exintro=1&explaintext=1&format=json` + (gcmcontinue ? `&gcmcontinue=${gcmcontinue}` : "");
        const res = await fetch(url, { headers: { 'User-Agent': 'EldenRingQuestGenerator/1.0' } });
        
        if (!res.ok) {
           console.error(`Status ${res.status} on SOTE fetch for ${route}. Breaking.`);
           break;
        }

        const data = await res.json();
        
        if (data.error) {
           console.error(`Wiki.gg API Error on ${route}:`, data.error.info);
           break;
        }
        
        if (data.query && data.query.pages) {
          const pages = Object.values(data.query.pages) as any[];
          const validPages = pages.filter(page => !page.title.startsWith('Category:') && !page.title.startsWith('File:'));
          
          fetched += validPages.length;

          const parsedItems: IdListItem[] = [];
          
          for (const page of validPages) {
            let imageUrl = '';
            const rev = page.revisions?.[0];
            const wikitext = rev?.slots?.main?.['*'] || rev?.['*'] || '';
            
            // STRICT SotE Filter: Check for {{SotE}}, {{SOTE}}, or dlc = Shadow of the Erdtree
            if (wikitext && (wikitext.match(/\{\{SotE\}\}/i) || wikitext.match(/dlc\s*=\s*(?:Shadow of the Erdtree|SotE)/i))) {
               questId++;
               
               // Match the image field in the infobox
               const imageMatch = wikitext.match(/\|\s*image\s*=\s*([^\n]+)/);
               if (imageMatch && imageMatch[1]) {
                  let imageName = imageMatch[1].trim();
                  
                  // If it's wrapped in wikilink brackets [[File:Name.png|...]]
                  if (imageName.startsWith('[[')) {
                     imageName = imageName.replace(/\[\[(?:File:|Image:)?([^|\]]+).*?\]\]/i, '$1').trim();
                  }
                  
                  const formattedName = imageName.replace(/ /g, '_');
                  const encodedName = encodeURIComponent(formattedName).replace(/'/g, "%27");
                  // MediaWiki requires the hash directory path or a Special:FilePath lookup for raw images
                  imageUrl = `https://eldenring.wiki.gg/wiki/Special:FilePath/${encodedName}`;
               }
               
               parsedItems.push({
                 id: page.pageid ? page.pageid.toString() : questId.toString(),
                 name: page.title.replace(' (Shadow of the Erdtree)', ''),
                 image: imageUrl,
                 description: page.extract || 'No description available for this DLC item.',
                 route: route as any,
                 questId: `sote_${questId}`
               });
            }
          }
          
          soteList.push(...parsedItems);
        }

        if (data.continue && data.continue.gcmcontinue) {
           gcmcontinue = data.continue.gcmcontinue;
        } else {
           break;
        }
      }
    } catch (e) {
      console.error(`Failed to fetch SOTE data for route ${route}:`, e);
    }
  }
  
  return soteList;
}
