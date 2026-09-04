import React from "react";
import { Filter, RotateCcw, Loader2 } from "lucide-react";

interface JobsSidebarFilterProps {
  allSources: string[];
  allLocations: string[];
  allJobTypes: string[];

  selectedSources: string[];
  selectedLocations: string[];
  selectedJobTypes: string[];

  activeOnly: boolean;
  sort: string;

  onSourceToggle: (source: string) => void;
  onLocationToggle: (location: string) => void;
  onJobTypeToggle: (jobType: string) => void;

  onActiveOnlyChange: (value: boolean) => void;
  onSortChange: (value: string) => void;

  onClearFilters: () => void;

  isOpen: boolean;
  isLoading?: boolean;
}

export default function JobsSidebarFilter({
  allSources,
  allLocations,
  allJobTypes,

  selectedSources,
  selectedLocations,
  selectedJobTypes,

  activeOnly,
  sort,

  onSourceToggle,
  onLocationToggle,
  onJobTypeToggle,

  onActiveOnlyChange,
  onSortChange,

  onClearFilters,

  isOpen,
  isLoading = false,
}: JobsSidebarFilterProps) {
  const hasFilters =
    selectedSources.length > 0 ||
    selectedLocations.length > 0 ||
    selectedJobTypes.length > 0 ||
    activeOnly;

  return (
    <aside
      className={`w-full md:w-64 shrink-0 bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl border border-slate-800/80 ${
        isOpen ? "block" : "hidden md:block"
      }`}
    >
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Filter size={16} className="text-indigo-400" />
            <span>Filters</span>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-400 transition-colors"
            >
              <RotateCcw size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Sort by
          </label>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500/50"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="deadline">Closing Soon</option>
            <option value="company">Company</option>
            <option value="title">Job Title</option>
          </select>
        </div>

        {/* Active jobs */}
        <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-slate-200">
              Active jobs only
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Hide expired opportunities
            </p>
          </div>

          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => onActiveOnlyChange(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
          />
        </label>

        {/* Sources */}
        <FilterSection
          title="Sources"
          items={allSources}
          selected={selectedSources}
          onToggle={onSourceToggle}
          isLoading={isLoading}
        />

        {/* Locations */}
        <FilterSection
          title="Location"
          items={allLocations}
          selected={selectedLocations}
          onToggle={onLocationToggle}
          isLoading={isLoading}
        />

        {/* Job Types */}
        <FilterSection
          title="Job Type"
          items={allJobTypes}
          selected={selectedJobTypes}
          onToggle={onJobTypeToggle}
          isLoading={isLoading}
        />
      </div>
    </aside>
  );
}

interface FilterSectionProps {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
  isLoading: boolean;
}

function FilterSection({
  title,
  items,
  selected,
  onToggle,
  isLoading,
}: FilterSectionProps) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold text-slate-300">
        {title}
      </h3>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-4 text-slate-500 gap-2">
            <Loader2 size={14} className="animate-spin text-indigo-400" />
            <span className="text-[11px]">Loading {title.toLowerCase()}...</span>
          </div>
        ) : items.length > 0 ? (
          items.map((item) => {
            const checked = selected.includes(item);

            return (
              <label
                key={item}
                className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                  checked
                    ? "bg-indigo-500/10 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer shrink-0"
                />

                <span className="text-xs truncate">
                  {item}
                </span>
              </label>
            );
          })
        ) : (
          <p className="text-[11px] text-slate-500 italic">
            No options available
          </p>
        )}
      </div>
    </div>
  );
}