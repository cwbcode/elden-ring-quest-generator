"use client";

import { useState } from "react";
import ClientGate from "./ClientGate";
import { IdListItem } from "../types";

export default function TabsContainer({ baseList, soteList }: { baseList: IdListItem[], soteList: IdListItem[] }) {
  const [activeTab, setActiveTab] = useState<'base' | 'sote'>('base');

  const onNewJourney = () => {
    if (activeTab === 'base') {
      localStorage.setItem("sote.unobsPool", "[]");
    } else {
      localStorage.setItem("unobsPool", "[]");
    }
  };

  return (
    <div className="w-full flex flex-col items-center relative">
      <div className="flex gap-4 mb-8 z-20">
        <button 
          onClick={() => setActiveTab('base')}
          className={`px-6 py-2 font-serif tracking-widest uppercase text-sm rounded shadow-md border transition-all ${activeTab === 'base' ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-[#110f0a]/50 border-[#d4af37]/30 text-[#e6ddc5]/70 hover:text-[#d4af37] hover:border-[#d4af37]/60'}`}
        >
          Base Game
        </button>
        <button 
          onClick={() => setActiveTab('sote')}
          className={`px-6 py-2 font-serif tracking-widest uppercase text-sm rounded shadow-md border transition-all ${activeTab === 'sote' ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-[#110f0a]/50 border-[#d4af37]/30 text-[#e6ddc5]/70 hover:text-[#d4af37] hover:border-[#d4af37]/60'}`}
        >
          Shadow of the Erdtree
        </button>
      </div>

      {activeTab === 'base' && <ClientGate key="base" storagePrefix="" questList={baseList} onNewJourney={onNewJourney} />}
      {activeTab === 'sote' && <ClientGate key="sote" storagePrefix="sote" questList={soteList} onNewJourney={onNewJourney} />}
    </div>
  );
}
