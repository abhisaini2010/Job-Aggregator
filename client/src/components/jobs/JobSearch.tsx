interface JobSearchProps {
  searchMode: "keyword" | "semantic";
  onSearchModeChange: (value: "keyword" | "semantic") => void;

  keyword: string;
  location: string;
  workMode: string;
  jobType: string;
  remoteScope: string;

  sort: string;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onWorkModeChange: (value: string) => void;
  onJobTypeChange: (value: string) => void;
  onRemoteScopeChange: (value: string) => void;

  onSortChange: (value: string) => void;

  onSearch: () => void;
  onClear: () => void;
}

const JobSearch = ({
  searchMode,
  onSearchModeChange,
  keyword,
  location,
  workMode,
  jobType,
  remoteScope,
 
  sort,
  onKeywordChange,
  onLocationChange,
  onWorkModeChange,
  onJobTypeChange,
  onRemoteScopeChange,
  
  onSortChange,
  onSearch,
  onClear,
}: JobSearchProps) => {
  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

 {/* Search Mode */}
    <div className="mb-5">
      <label
        htmlFor="search-mode"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Search Mode
      </label>

      <select
        id="search-mode"
        value={searchMode}
        onChange={(e) =>
          onSearchModeChange(
            e.target.value as "keyword" | "semantic"
          )
        }
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 md:w-72"
      >
        <option value="keyword">
          Keyword Search
        </option>

        <option value="semantic">
          Semantic Search
        </option>
      </select>

      {searchMode === "semantic" && (
        <p className="mt-2 text-sm text-gray-500">
          Search using meaning and context, not just exact keywords.
        </p>
      )}
    </div>

      {/* Search Inputs */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Keyword */}
        <div>
          <label
            htmlFor="job-search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Search Jobs
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔎
            </span>

            <input
              id="job-search"
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
             placeholder={
  searchMode === "semantic"
    ? "Describe the job you're looking for..."
    : "Job title, company, or skill..."
}
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location-search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Location
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              📍
            </span>

            <input
              id="location-search"
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="City or country..."
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
   <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

        {/* Work Mode */}
        <div>
          <label
            htmlFor="work-mode"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Work Mode
          </label>

          <select
            id="work-mode"
            value={workMode}
            onChange={(e) => onWorkModeChange(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Not specified">Not specified</option>
          </select>
        </div>

        {/* Job Type */}
        <div>
          <label
            htmlFor="job-type"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Job Type
          </label>

          <select
            id="job-type"
            value={jobType}
            onChange={(e) => onJobTypeChange(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Remote Scope */}
        <div>
          <label
            htmlFor="remote-scope"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Remote Scope
          </label>

          <select
            id="remote-scope"
            value={remoteScope}
            onChange={(e) => onRemoteScopeChange(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Remote Scopes</option>
            <option value="Worldwide">Worldwide</option>
            <option value="Country">Country</option>
            <option value="Not applicable">Not applicable</option>
          </select>
        </div>

      
        {/* Sort By */}
<div>
  <label
    htmlFor="sort"
    className="mb-2 block text-sm font-medium text-gray-700"
  >
    Sort By
  </label>

  <select
    id="sort"
    value={sort}
    onChange={(e) => onSortChange(e.target.value)}
    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
  >
    <option value="latest">Latest Jobs</option>
    <option value="oldest">Oldest Jobs</option>
  </select>
</div>
      </div>

      {/* Buttons */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
        >
          Clear Filters
        </button>

        <button
          type="button"
          onClick={onSearch}
          className="rounded-xl bg-blue-600 px-7 py-3 font-medium text-white transition hover:bg-blue-700 cursor-pointer"
        >
          🔎 Search Jobs
        </button>

      </div>
    </div>
  );
};

export default JobSearch;

