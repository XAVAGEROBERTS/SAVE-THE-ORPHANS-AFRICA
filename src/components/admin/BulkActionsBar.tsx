"use client";

import { X, Trash2, Download } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  extraActions?: React.ReactNode;
}

export function BulkActionsBar({
  selectedCount,
  onClear,
  onDelete,
  onExport,
  extraActions,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#0B3D2E] text-white rounded-full shadow-2xl border border-white/10 px-4 py-3 flex items-center gap-3 md:gap-4">
      <div className="flex items-center gap-2 pl-2">
        <span className="bg-gold text-[#0B3D2E] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {selectedCount}
        </span>
        <span className="text-sm font-medium hidden sm:inline">
          selected
        </span>
      </div>

      <div className="w-px h-6 bg-white/20" />

      {extraActions}

      {onExport && (
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-red-300 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      )}

      <div className="w-px h-6 bg-white/20" />

      <button
        onClick={onClear}
        className="flex items-center gap-1 px-2 py-1.5 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}