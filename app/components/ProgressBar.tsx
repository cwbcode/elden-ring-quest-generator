"use client";

import { useState } from "react";
import { IdListItem, QuestLogItem, routes } from "../types";

type ProgressBarProps = {
    questListState: Array<IdListItem>;
    questLog: Array<QuestLogItem>;
    unobtainablePool: Array<IdListItem>;
};

export default function ProgressBar({ questListState, questLog, unobtainablePool }: ProgressBarProps) {
    const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

    const totalQuests = questListState.length + questLog.filter(q => !q.isJourneyMarker).length + unobtainablePool.length;
    const completedQuests = questLog.filter(q => q.completed && !q.isJourneyMarker).length;

    const percentage = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

    // Stats by route
    const stats = routes.map(route => {
        const logForRoute = questLog.filter(q => q.route === route && !q.isJourneyMarker);
        const listForRoute = questListState.filter(q => q.route === route);
        const unobsForRoute = unobtainablePool.filter(q => q.route === route);

        const routeTotal = logForRoute.length + listForRoute.length + unobsForRoute.length;
        const routeCompleted = logForRoute.filter(q => q.completed).length;

        return {
            route,
            total: routeTotal,
            completed: routeCompleted,
            percentage: routeTotal > 0 ? (routeCompleted / routeTotal) * 100 : 0
        };
    }).filter(stat => stat.total > 0);

    return (
        <div
            className="w-full max-w-2xl px-4 py-2 relative cursor-default mb-8"
            onMouseMove={(e) => setHoverPos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHoverPos(null)}
        >
            <div className="flex justify-between text-[#d4af37] text-xs font-serif mb-2 uppercase tracking-widest px-1">
                <span>Quests Completed</span>
                <span>{completedQuests} / {totalQuests}</span>
            </div>

            {/* Background bar */}
            <div className="h-4 w-full bg-[#110f0a] border border-[#d4af37]/40 rounded-sm relative overflow-hidden shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                {/* Fill bar */}
                <div
                    className="h-full bg-emerald-700 transition-all duration-500 ease-out border-r border-[#d4af37]/60 shadow-[0_0_15px_rgba(4,120,87,0.5)]"
                    style={{ width: `${percentage}%` }}
                />
                {/* Segments overlay using a repeating linear gradient */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'repeating-linear-gradient(to right, transparent, transparent 19px, #110f0a 19px, #110f0a 20px)'
                    }}
                />
            </div>

            {/* Tooltip */}
            {hoverPos && (
                <div
                    className="fixed z-50 bg-[#1a1814]/95 backdrop-blur-md border border-[#d4af37]/40 p-4 rounded shadow-2xl pointer-events-none transform -translate-x-1/2 mt-4 min-w-[320px]"
                    style={{
                        left: hoverPos.x,
                        top: hoverPos.y
                    }}
                >
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {stats.map(stat => (
                            <div key={stat.route} className="flex flex-col gap-1 text-xs font-serif text-[#e6ddc5]">
                                <div className="flex justify-between">
                                    <span className="capitalize text-[#d4af37]">{stat.route}</span>
                                    <span>{stat.completed} / {stat.total}</span>
                                </div>
                                <div className="h-1.5 w-full bg-[#110f0a] border border-[#d4af37]/20 rounded-sm overflow-hidden relative">
                                    <div
                                        className="h-full bg-emerald-700/80 transition-all duration-500"
                                        style={{ width: `${stat.percentage}%` }}
                                    />
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: 'repeating-linear-gradient(to right, transparent, transparent 19px, #110f0a 19px, #110f0a 20px)'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
