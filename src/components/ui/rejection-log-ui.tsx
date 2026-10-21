"use client";

import React, { useState } from "react";

export interface RejectionItem {
  id: string;
  source: string;
  title: string;
  timestamp: string;
  rejectionReason: string;
  category: string;
  confidence: number;
}

interface RejectionLogProps {
  initialItems?: RejectionItem[];
  onOverturn?: (item: RejectionItem) => void;
}

export const RejectionLog: React.FC<RejectionLogProps> = ({
  initialItems = [
    {
      id: "rej-1",
      source: "FDA Enforcement Feed",
      title: "Class II recall: Hazelnut paste lot #4921",
      timestamp: "Today, 06:14 AM",
      rejectionReason: "Store inventory does not carry hazelnut paste or derivative skus",
      category: "Inventory Mismatch",
      confidence: 0.99,
    },
    {
      id: "rej-2",
      source: "City Council Consent Calendar",
      title: "Resolution 841: Municipal fleet EV charging stations",
      timestamp: "Yesterday, 08:30 PM",
      rejectionReason: "City public property only; zero commercial property tax or utility impact",
      category: "Municipal Exemption",
      confidence: 0.98,
    },
    {
      id: "rej-3",
      source: "USDA FSIS Alert",
      title: "Poultry inspection schedule update (Region 4)",
      timestamp: "Oct 14, 02:15 PM",
      rejectionReason: "Store operates in Region 9; zero geographical overlap",
      category: "Jurisdiction Outside",
      confidence: 1.0,
    },
  ],
  onOverturn,
}) => {
  const [items, setItems] = useState<RejectionItem[]>(initialItems);
  const [filter, setFilter] = useState<string>("all");

  const handleOverturn = (item: RejectionItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (onOverturn) onOverturn(item);
  };

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#08080c]/90 p-5 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-semibold text-white tracking-tight">
              Silence is the Product • Rejection Log
            </h3>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            Noise filtered in background. Showing decisions where the agent chose NOT to interrupt you.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-white/70 border border-white/10">
            {items.length} Silent Filters
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-400 border border-emerald-500/20">
            95.8% Noise Removed
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              filter === cat
                ? "bg-white/15 text-white shadow-sm border border-white/20"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-3 divide-y divide-white/5 max-h-[360px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-white/40">
            No rejected items in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400/80">{item.source}</span>
                  <span className="text-[10px] text-white/40 font-mono">• {item.timestamp}</span>
                </div>
                <div className="text-sm font-medium text-white/90">{item.title}</div>
                <div className="text-xs text-rose-300/80 flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Reason: {item.rejectionReason}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-[11px] font-mono text-white/40">
                  {(item.confidence * 100).toFixed(0)}% conf
                </span>
                <button
                  onClick={() => handleOverturn(item)}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 transition-all active:scale-95"
                  title="Overturn rejection and escalate to review"
                >
                  Overturn
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
