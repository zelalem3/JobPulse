
import React from "react";
import {
  Filter,
  RotateCcw,
  Loader2,
  MapPin,
  BriefcaseBusiness,
  Layers3,
  ArrowDownUp,
  Check,
} from "lucide-react";

interface JobsSidebarFilterProps {
  allSources: string[];
  allLocations: string[];
  allJobTypes: string[];
  allCategories: string[];

  selectedSources: string[];
  selectedLocations: string[];
  selectedJobTypes: string[];
  selectedCategories: string[];

  activeOnly: boolean;
  sort: string;

  onSourceToggle: (source: string) => void;
  onLocationToggle: (location: string) => void;
  onJobTypeToggle: (jobType: string) => void;
  onCategoryToggle: (category: string) => void;

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
  allCategories,
  selectedSources,
  selectedLocations,
  selectedJobTypes,
  selectedCategories,
  activeOnly,
  sort,
  onSourceToggle,
  onLocationToggle,
  onJobTypeToggle,
  onCategoryToggle,
  onActiveOnlyChange,
  onSortChange,
  onClearFilters,
  isOpen,
  isLoading = false,
}: JobsSidebarFilterProps) {
  const selectedCount =
    selectedSources.length +
    selectedLocations.length +
    selectedJobTypes.length +
    selectedCategories.length;

  const hasFilters = selectedCount > 0 || activeOnly;

  return (
    <aside
      className={`w-full shrink-0 md:w-64 ${
        isOpen ? "block" : "hidden md:block"
      }`}
    >
      <div className="rounded-2xl border border-white/[0.08] bg-[#101827] p-4 shadow-lg shadow-black/10 sm:p-5">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-400/[0.08] text-emerald-200">
                <Filter size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Filters
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Refine your search
                </p>
              </div>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-emerald-200"
              >
                <RotateCcw size={13} />
                Clear
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <label
              htmlFor="jobs-sort"
              className="flex items-center gap-2 text-xs font-semibold text-slate-300"
            >
              <ArrowDownUp size={14} className="text-slate-400" />
              Sort by
            </label>

            <select
              id="jobs-sort"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full rounded-xl border border-white/[0.1] bg-[#0b111d] px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
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
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 transition-colors hover:border-emerald-300/25">
            <div>
              <p className="text-sm font-medium text-slate-200">
                Active jobs only
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Hide expired opportunities
              </p>
            </div>

            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => onActiveOnlyChange(e.target.checked)}
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-500 accent-emerald-400 focus:ring-emerald-400"
            />
          </label>
           {/* Categories */}
          <FilterSection
            title="Category"
            icon={<Layers3 size={15} />}
            items={allCategories}
            selected={selectedCategories}
            onToggle={onCategoryToggle}
            isLoading={isLoading}
          />

          {/* Sources */}
          <FilterSection
            title="Sources"
            icon={<Layers3 size={15} />}
            items={allSources}
            selected={selectedSources}
            onToggle={onSourceToggle}
            isLoading={isLoading}
          />

          {/* Locations */}
          <FilterSection
            title="Location"
            icon={<MapPin size={15} />}
            items={allLocations}
            selected={selectedLocations}
            onToggle={onLocationToggle}
            isLoading={isLoading}
          />

          {/* Job types */}
          <FilterSection
            title="Job Type"
            icon={<BriefcaseBusiness size={15} />}
            items={allJobTypes}
            selected={selectedJobTypes}
            onToggle={onJobTypeToggle}
            isLoading={isLoading}
          />

         

          {selectedCount > 0 && (
            <div className="border-t border-white/[0.08] pt-3">
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-emerald-300">
                  {selectedCount}
                </span>{" "}
                selected filter{selectedCount === 1 ? "" : "s"}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
  isLoading: boolean;
}

function FilterSection({
  title,
  icon,
  items,
  selected,
  onToggle,
  isLoading,
}: FilterSectionProps) {
  return (
    <section className="space-y-2.5">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="text-slate-500">
          {icon}
        </span>
        {title}
        {selected.length > 0 && (
          <span className="ml-auto rounded-md border border-emerald-300/15 bg-emerald-400/[0.08] px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">
            {selected.length}
          </span>
        )}
      </h3>

      <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
            <Loader2 size={15} className="animate-spin" />
            <span className="text-xs">
              Loading {title.toLowerCase()}...
            </span>
          </div>
        ) : items.length > 0 ? (
          items.map((item) => {
            const checked = selected.includes(item);

            return (
              <label
                key={item}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
                  checked
                    ? "bg-emerald-400/[0.08] text-emerald-200"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item)}
                  className="peer sr-only"
                />

                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    checked
                      ? "border-emerald-400 bg-emerald-400 text-slate-950"
                      : "border-slate-600 bg-[#0b111d]"
                  }`}
                >
                  {checked && <Check size={11} strokeWidth={3} />}
                </span>

                <span className="min-w-0 flex-1 truncate text-xs">
                  {item}
                </span>
              </label>
            );
          })
        ) : (
          <p className="py-2 text-xs italic text-slate-400">
            No options available
          </p>
        )}
      </div>
    </section>
  );
}
