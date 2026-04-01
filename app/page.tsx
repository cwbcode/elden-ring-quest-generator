import TabsContainer from "./components/TabsContainer";
import { scrapeSoteAPI } from "./sote-api";
import { IdListItem, EldenRingListResponse, routes } from "./types";

const api = 'https://eldenring.fanapis.com/api'

const scrapeAPI = async () => {
  const idList: Array<IdListItem> = []
  let questId: number = -1;
  for (const route of routes) {
    let reqCount = 0;
    let currentPage = 0;
    while (reqCount <= 100) {
      reqCount++;
      const results: EldenRingListResponse = await (await fetch(`${api}/${route}?limit=100&page=${currentPage}`)).json();
      if (results.data.length === 0) {
        break;
      } else {
        currentPage++
        idList.push(
          ...results.data.map(
            listItem => {
              questId++;
              return { ...listItem, route, questId }
            }
          )
        )
      }
    }
    if (reqCount === 100) {
      console.error(`aborting route:${route} due to too many requests. This is most likely a bug`)
    }
  }
  return idList;
}



export default async function Home() {
  const questList: Array<IdListItem> = await scrapeAPI();
  const soteList: Array<IdListItem> = await scrapeSoteAPI();

  return (
    <div className="flex min-h-screen justify-center bg-[#0a0a09] font-sans text-[#e6ddc5]">
      {/* Panning Background Image */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-no-repeat opacity-30 animate-pan"
        style={{ backgroundImage: "url('/ELDENRING_SotE_art01.png')" }}
      />
      {/* Dark overlay gradient to ensure readability */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#0a0a09]/50 via-transparent to-[#0a0a09]" />

      <main className="relative z-10 flex min-h-screen w-full max-w-2xl flex-col items-center py-20 px-4 sm:px-8">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-widest text-[#d4af37] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase">
            Elden Ring Quest Generator
          </h1>
          <div className="h-px w-64 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
        </div>

        <div className="w-full relative">
          <TabsContainer baseList={questList} soteList={soteList} />
        </div>
      </main>
    </div>
  );
}

