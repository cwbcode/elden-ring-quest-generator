/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import ListCard from "./ListCard";
import { IdListItem, QuestLogItem, routes, Route } from "../types";

type ClientGateProps = {
  questList: Array<IdListItem>;
};

function pickFirstQuest(list: Array<IdListItem>) {
  if (list.length === 0) return { questLog: [] as QuestLogItem[], questListState: [] as IdListItem[] };

  const firstIndex = Math.floor(Math.random() * list.length);
  const firstQuest = list[firstIndex];
  return {
    questLog: [{ ...firstQuest, completed: false }],
    questListState: list.filter(q => q.questId !== firstQuest.questId),
  };
}

export default function ClientGate({ questList }: ClientGateProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [questLog, setQuestLog] = useState<Array<QuestLogItem>>([]);
  const [questListState, setQuestListState] = useState<Array<IdListItem>>([]);
  const [selectedFilter, setSelectedFilter] = useState<Route | 'any'>('any');

  useEffect(() => {
    setIsMounted(true);
    let loadedFromStorage = false;
    try {
      const savedLogRaw = localStorage.getItem("questLog");
      const savedListRaw = localStorage.getItem("questList");

      if (savedLogRaw && savedListRaw) {
        const savedLog = JSON.parse(savedLogRaw);
        const savedList = JSON.parse(savedListRaw);

        if (Array.isArray(savedLog) && Array.isArray(savedList) && savedLog.length > 0) {

          setQuestLog(savedLog);

          setQuestListState(savedList);
          loadedFromStorage = true;
        }
      }
    } catch {
      // ignore corrupted storage and fall back
    }

    if (!loadedFromStorage) {
      const initial = pickFirstQuest(questList);

      setQuestLog(initial.questLog);

      setQuestListState(initial.questListState);
    }
  }, [questList]);

  // Persist whenever state changes.
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("questLog", JSON.stringify(questLog));
    localStorage.setItem("questList", JSON.stringify(questListState));
  }, [questLog, questListState, isMounted]);



  const completeQuest = (questId: number) => {
    // We need to avoid doing side effects or mutations inside state updater functions,
    // especially because React can call them multiple times in StrictMode or concurrent rendering.

    setQuestLog(prevLog => {
      const idx = prevLog.findIndex(q => q.questId === questId);
      if (idx === -1) return prevLog;

      // Mark the current quest as completed
      const next = [...prevLog];
      next[idx] = { ...next[idx], completed: true };

      // Check if everything is completed after this update
      if (next.length > 0 && next.every(q => q.completed)) {

        // Filter the available quests based on the user's dropdown selection
        const availableQuests = selectedFilter === 'any'
          ? questListState
          : questListState.filter(q => q.route === selectedFilter);

        // If so, we safely pick ONE new quest from the current questListState
        if (availableQuests.length > 0) {
          const questIndex = Math.floor(Math.random() * availableQuests.length);
          const newQuest = availableQuests[questIndex];

          // Add it to our new log array
          next.push({ ...newQuest, completed: false });

          // Update the list state to remove the quest we just picked
          setQuestListState(prevList => prevList.filter(q => q.questId !== newQuest.questId));
        }
      }

      return next;
    });
  };

  if (!isMounted) {
    return null;
  }

  // Calculate how many quests are actually left for the current filter
  const availableQuestsForFilter = selectedFilter === 'any'
    ? questListState
    : questListState.filter(q => q.route === selectedFilter);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Filter UI */}
      <div className="w-full max-w-sm mb-6 flex flex-col items-center sm:items-start z-20">
        <label htmlFor="quest-filter" className="text-[#d4af37]/80 text-sm font-serif italic mb-2 tracking-wide uppercase">
          Quest Type
        </label>
        <div className="relative w-full">
          <select
            id="quest-filter"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as Route | 'any')}
            className="w-full appearance-none bg-[#110f0a] border border-[#d4af37]/30 text-[#e6ddc5] py-3 px-4 rounded-lg shadow-inner focus:outline-none focus:border-[#d4af37]/80 focus:ring-1 focus:ring-[#d4af37]/80 cursor-pointer font-serif transition-colors"
          >
            <option value="any">Any</option>
            {routes.map(r => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#d4af37]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative w-full py-8 flex justify-center">
        {/* 
          The overarching vertical "Quest Line" that connects the cards 
        */}
        {questLog.length > 0 && (
          <div className="absolute left-[59px] sm:left-[91px] top-4 bottom-4 w-1 bg-gradient-to-b from-[#d4af37]/0 via-[#d4af37]/40 to-[#d4af37]/0 rounded-full" />
        )}

        <div className="flex flex-col gap-12 w-full max-w-3xl z-10">
          {questLog.map(quest => (
            <ListCard key={quest.questId} quest={quest} completeQuest={completeQuest} />
          ))}

          {/* Empty State when no quests remain for the selected filter and the log is empty/completed */}
          {availableQuestsForFilter.length === 0 && (questLog.length === 0 || questLog.every(q => q.completed)) && (
            <div className="mt-8 flex justify-center w-full">
              <div className="bg-[#1f1b14] block max-w-sm p-8 border border-[#d4af37]/40 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:bg-[#2a2418] transition-colors relative pl-12 sm:pl-16">
                {/* Optional ending node on the empty state box */}
                <div className="absolute left-[11px] sm:left-[27px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#d4af37] bg-[#d4af37] shadow-[0_0_10px_#d4af37] z-10" />
                <h5 className="text-2xl font-serif font-bold tracking-tight text-[#d4af37] leading-8 drop-shadow-md">
                  You&#39;ve done everything 😵
                </h5>
                <p className="mt-2 text-sm text-[#8c8273]">
                  {selectedFilter === 'any'
                    ? "There are no quests remaining in the Lands Between."
                    : `There are no remaining quests of the type: ${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}. Select another category.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}