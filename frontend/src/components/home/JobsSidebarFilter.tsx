
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
  SlidersHorizontal,
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
    selectedCategories.length +
    (activeOnly ? 1 : 0);

  const hasFilters = selectedCount > 0;

  return (
    <aside
      className={`w-full shrink-0 self-start overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/80 shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 md:sticky md:top-6 md:w-72 ${
        isOpen ? "block" : "hidden md:block"
      }`}
    >
      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-800/80 p-5">
        <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-emerald-500/[0.07] blur-3xl" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <SlidersHorizontal
                size={19}
                className="text-emerald-400"
              />
            </div>

            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Refine results
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Customize your job search
              </p>
            </div>
          </div>

          {hasFilters && (
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 text-xs font-bold text-emerald-300">
              {selectedCount}
            </span>
          )}
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/50 px-3 py-2.5 text-xs font-semibold text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/[0.06] hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <RotateCcw size={13} />
            Clear all filters
          </button>
        )}
      </div>

      <div className="space-y-6 p-4">
        {/* Sorting */}
        <section>
          <SectionHeading
            icon={<ArrowDownUp size={14} />}
            title="Sort results"
          />

          <div className="relative mt-3">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort jobs"
              className="w-full appearance-none rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-3 pr-9 text-xs font-medium text-slate-200 outline-none transition hover:border-slate-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
            >
              <option value="relevance">Most relevant</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="deadline">Closing soon</option>
              <option value="company">Company name</option>
              <option value="title">Job title</option>
            </select>

            <ArrowDownUp
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </section>

        {/* Active opportunities */}
        <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Check size={16} className="text-emerald-400" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Active jobs only
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                  Hide expired opportunities
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => onActiveOnlyChange(e.target.checked)}
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-600 bg-slate-900 accent-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-2 focus:ring-offset-slate-950"
            />
          </label>
        </section>

        {/* Sources */}
        <FilterSection
          title="Sources"
          icon={<Layers3 size={14} />}
          items={allSources}
          selected={selectedSources}
          onToggle={onSourceToggle}
          isLoading={isLoading}
        />

        {/* Locations */}
        <FilterSection
          title="Location"
          icon={<MapPin size={14} />}
          items={allLocations}
          selected={selectedLocations}
          onToggle={onLocationToggle}
          isLoading={isLoading}
        />

        {/* Job categories */}
        <FilterSection
          title="Categories"
          icon={<BriefcaseBusiness size={14} />}
          items={allCategories}
          selected={selectedCategories}
          onToggle={onCategoryToggle}
          isLoading={isLoading}
        />

        {/* Job types: included because the original component already supports them */}
        <FilterSection
          title="Job type"
          icon={<BriefcaseBusiness size={14} />}
          items={allJobTypes}
          selected={selectedJobTypes}
          onToggle={onJobTypeToggle}
          isLoading={isLoading}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/80 bg-slate-950/40 px-5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-medium text-slate-500">
              Filters update your results
            </span>
          </div>

          {isLoading && (
            <Loader2
              size={13}
              className="animate-spin text-emerald-400"
            />
          )}
        </div>
      </div>
    </aside>
  );
}

interface SectionHeadingProps {
  icon: React.ReactNode;
  title: string;
}

function SectionHeading({ icon, title }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-emerald-400">{icon}</span>
      <h3 className="text-xs font-bold text-slate-200">{title}</h3>
    </div>
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
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <SectionHeading icon={icon} title={title} />

        {selected.length > 0 && (
          <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
            {selected.length} selected
          </span>
        )}
      </div>

      <div className="max-h-48 space-y-1 overflow-y-auto pr-1 [scrollbar-color:#334155_transparent] [scrollbar-width:thin]">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/40 py-5 text-slate-500">
            <Loader2
              size={14}
              className="animate-spin text-emerald-400"
            />
            <span className="text-[11px]">
              Loading {title.toLowerCase()}...
            </span>
          </div>
        ) : items.length > 0 ? (
          items.map((item) => {
            const checked = selected.includes(item);

            return (
              <label
                key={item}
                className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 ${
                  checked
                    ? "border-emerald-500/20 bg-emerald-500/[0.08]"
                    : "border-transparent hover:border-slate-800 hover:bg-slate-800/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item)}
                  className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-slate-600 bg-slate-950 accent-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                />

                <span
                  className={`min-w-0 flex-1 truncate text-xs transition-colors ${
                    checked
                      ? "font-semibold text-emerald-200"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                  title={item}
                >
                  {item}
                </span>

                {checked && (
                  <Check
                    size={13}
                    className="shrink-0 text-emerald-400"
                  />
                )}
              </label>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 px-3 py-5 text-center">
            <p className="text-[11px] text-slate-500">
              No options available
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
