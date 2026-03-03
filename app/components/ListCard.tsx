"use client";
import Image from "next/image";
import { IdListItem, Route } from "../types";

const commands = (route: Route): string => {
  switch (route) {
    case 'locations': return 'Explore this Location';
    case 'npcs': return 'Speak to this individual';
    case 'creatures': return 'Hunt this creature';
    case 'bosses': return 'Defeat this great enemy';
    default: return 'Retrieve this item';
  }
}

type ListCardProps = {
  quest: IdListItem & { completed: boolean; inLog?: boolean; unobtainable?: boolean; isJourneyMarker?: boolean };
  completeQuest: (questId: string | number) => void;
  addToLog?: (questId: string | number) => void;
  markUnobtainable?: (questId: string | number) => void;
};


export default function ListCard({ quest, completeQuest, addToLog, markUnobtainable }: ListCardProps) {
  if (quest.isJourneyMarker) {
    return (
      <div className="w-full flex justify-center my-8 z-10 relative">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#d4af37] tracking-widest uppercase drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">
          {quest.name}
        </h2>
      </div>
    );
  }

  return (
    <div id={`quest-${quest.questId}`} className="relative pl-12 sm:pl-16 w-full max-w-2xl mx-auto group">
      {/* 
        The node on the quest line. 
        It sits to the left, on top of the vertical line rendered by the parent.
      */}
      <div
        className={`absolute left-[11px] sm:left-[27px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-10 transition-colors duration-500
          ${quest.completed ? 'bg-[#d4af37] border-[#d4af37] shadow-[0_0_10px_#d4af37]' : 'bg-[#1a1814] border-[#d4af37]/50'}`}
      />

      {/* The actual card */}
      <div
        className={`
          relative flex w-full rounded-xl border border-[#d4af37]/30 bg-gradient-to-br from-[#1f1b14] to-[#0a0a09] px-4 pb-4 pt-10 sm:px-6 sm:pb-6 sm:pt-12
          shadow-[inset_0_1px_1px_rgba(212,175,55,0.1),0_4px_20px_rgba(0,0,0,0.5)]
          transition-all duration-200 
          ${!quest.completed && !quest.unobtainable ? 'hover:border-[#d4af37]/60 hover:shadow-[0_4px_25px_rgba(212,175,55,0.15)]' : ''}
          ${quest.completed ? 'opacity-80' : ''}
          ${quest.unobtainable ? 'grayscale opacity-50 brightness-75' : ''}
        `}
      >
        {/* left: image */}
        {quest.image && (
          <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg border border-[#d4af37]/20 shadow-inner relative group/image">
            <Image
              src={quest.image}
              alt={quest.name}
              width={128}
              height={128}
              className="h-full w-full object-cover grayscale-[20%] sepia-[30%]"
            />
          </div>
        )}

        {/* Add to Quest Log Button */}
        {!quest.completed && !quest.inLog && !quest.unobtainable && addToLog && (
          <button
            onClick={() => addToLog(quest.questId)}
            className="absolute top-0 left-0 z-20 px-4 py-1 bg-[#1a1814] border-r border-b border-[#d4af37]/50 text-[#d4af37] font-serif tracking-widest uppercase text-[10px] sm:text-xs rounded-tl-xl rounded-br-lg shadow-[0_0_10px_rgba(212,175,55,0.1)] hover:bg-[#2a2418] border-t-0 border-l-0 hover:border-[#d4af37] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95"
            title="Add to Quest Log"
          >
            Add to Quest Log
          </button>
        )}

        {/* right: text */}
        <div className="ml-4 flex flex-col justify-start text-[#e6ddc5] w-full">
          <p className="text-sm sm:text-base font-serif italic text-[#d4af37]/80 tracking-widest uppercase mb-1">
            {commands(quest.route)}
          </p>
          <a
            href={`https://eldenring.wiki.gg/wiki/Special:Search?search=${encodeURIComponent(quest.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl sm:text-2xl font-serif font-bold tracking-wide drop-shadow-md hover:text-[#fff] hover:underline decoration-[#d4af37]/60 underline-offset-4 transition-colors w-fit"
          >
            {quest.name}
          </a>
          <p className="mt-2 text-sm sm:text-base text-[#b3aa99] leading-relaxed line-clamp-3">
            {quest.description}
          </p>
          {quest.location && (
            <p className="mt-3 text-xs sm:text-sm text-[#8c8273]">
              <span className="font-semibold text-[#d4af37]/60">Location Hint: </span>
              {quest.location}
            </p>
          )}

          {!quest.completed && !quest.unobtainable && (
            <div className="mt-5 flex justify-between items-end w-full">
              {markUnobtainable ? (
                <button
                  onClick={() => markUnobtainable(quest.questId)}
                  className="px-6 py-2 bg-[#1a1814] border border-[#7a7465]/50 text-[#7a7465] font-serif tracking-widest uppercase text-xs sm:text-sm rounded shadow-[0_0_10px_rgba(212,175,55,0.1)] hover:bg-[#2a2418] hover:border-[#d4af37] hover:text-[#d4af37] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95"
                >
                  Unobtainable
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => {
                  completeQuest(quest.questId);
                }}
                className="px-6 py-2 bg-[#1a1814] border border-[#d4af37]/50 text-[#d4af37] font-serif tracking-widest uppercase text-xs sm:text-sm rounded shadow-[0_0_10px_rgba(212,175,55,0.1)] hover:bg-[#2a2418] hover:border-[#d4af37] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95"
              >
                Complete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* The checkmark overlay */}
      {quest.completed && (
        <div className="pointer-events-none absolute -top-4 right-0 sm:-right-4 w-20 h-20 sm:w-24 sm:h-24 z-20 animate-stamp drop-shadow-[0_5px_15px_rgba(0,0,0,0.7)] opacity-0">
          <Image
            src="/quest-complete.png"
            alt="Quest completed"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}