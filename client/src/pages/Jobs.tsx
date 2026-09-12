import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  fetchJobs,
  fetchSemanticJobs,
  fetchRagJobs,
} from "../services/jobApi";
import type { Job, JobsResponse } from "../types/job";
import JobCard from "../components/jobs/JobCard";
import JobSearch from "../components/jobs/JobSearch";
import { useAuth } from "../context/AuthContext";
import RagAnswer from "./jobs/RagAnswer";
import AiJobAssistant from "./jobs/AiJobAssistant";

const getSavedJobSearchState = () => {
  try {
    const saved = sessionStorage.getItem("jobSearchState");

    if (!saved) {
      return null;
    }

    return JSON.parse(saved);
  } catch (error) {
    console.error(
      "Failed to restore job search state:",
      error
    );

    return null;
  }
};

const Jobs = () => {

  const savedSearchState = getSavedJobSearchState();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user, loading: authLoading, logout } = useAuth();

  // This flag is set by JobCard immediately before navigating to Job Details.
  // We only restore the previous page/search state in that case.
  const returningFromJobDetails =
    sessionStorage.getItem("returningFromJobDetails") === "true";

  const [jobs, setJobs] = useState<Job[]>([]);

  // A normal browser refresh must always start from page 1.
  // Previous page/search state is restored only when returning from Job Details.
  const [page, setPage] = useState(
    returningFromJobDetails
      ? Number(searchParams.get("page")) ||
          Number(savedSearchState?.page) ||
          1
      : 1
  );

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 const [ragAnswer, setRagAnswer] =
  useState<string>("");

const [ragContextJobs, setRagContextJobs] =
  useState(0);

const [ragLoading, setRagLoading] =
  useState(false);

const [ragError, setRagError] =
  useState("");
  // Search fields
  // URL/session state is restored only when returning from Job Details.
  const restoredKeyword = returningFromJobDetails
    ? searchParams.get("keyword") || savedSearchState?.keyword || ""
    : "";

  const restoredLocation = returningFromJobDetails
    ? searchParams.get("location") || savedSearchState?.location || ""
    : "";

  const restoredWorkMode = returningFromJobDetails
    ? searchParams.get("workMode") || savedSearchState?.workMode || ""
    : "";

  const restoredJobType = returningFromJobDetails
    ? searchParams.get("jobType") || savedSearchState?.jobType || ""
    : "";

  const restoredRemoteScope = returningFromJobDetails
    ? searchParams.get("remoteScope") || savedSearchState?.remoteScope || ""
    : "";

  const restoredSort = returningFromJobDetails
    ? searchParams.get("sort") || savedSearchState?.sort || "latest"
    : "latest";

  const restoredSearchMode: "keyword" | "semantic" =
    returningFromJobDetails &&
    (searchParams.get("searchMode") === "semantic" ||
      savedSearchState?.searchMode === "semantic")
      ? "semantic"
      : "keyword";

  const [keyword, setKeyword] = useState(restoredKeyword);
  const [location, setLocation] = useState(restoredLocation);
  const [workMode, setWorkMode] = useState(restoredWorkMode);
  const [jobType, setJobType] = useState(restoredJobType);
  const [remoteScope, setRemoteScope] = useState(restoredRemoteScope);
  const [sort, setSort] = useState(restoredSort);
  const [searchMode, setSearchMode] =
    useState<"keyword" | "semantic">(restoredSearchMode);

  // Filters actually used for fetching jobs.
  const [appliedFilters, setAppliedFilters] = useState({
    keyword: restoredKeyword,
    location: restoredLocation,
    workMode: restoredWorkMode,
    jobType: restoredJobType,
    remoteScope: restoredRemoteScope,
    sort: restoredSort,
    searchMode: restoredSearchMode,
  });

  // --------------------------------------------------
  // Handle normal Jobs page refresh
  // --------------------------------------------------
  useEffect(() => {
    if (returningFromJobDetails) {
      // Consume the one-time flag. The initial state above has already
      // restored the correct page and search filters.
      sessionStorage.removeItem("returningFromJobDetails");
      return;
    }

    // Normal browser refresh/direct visit:
    // always start from page 1 with a clean search.
    setPage(1);
    setKeyword("");
    setLocation("");
    setWorkMode("");
    setJobType("");
    setRemoteScope("");
    setSort("latest");
    setSearchMode("keyword");

    setAppliedFilters({
      keyword: "",
      location: "",
      workMode: "",
      jobType: "",
      remoteScope: "",
      sort: "latest",
      searchMode: "keyword",
    });

    setSearchParams({});
  }, []);

  // --------------------------------------------------
  // Fetch jobs
  // --------------------------------------------------
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------
        // Semantic Search
        // --------------------------------------------------
        if (appliedFilters.searchMode === "semantic") {
          const semanticSort =
            appliedFilters.sort === "latest"
              ? "newest"
              : "relevance";

          const data = await fetchSemanticJobs({
            q: appliedFilters.keyword,
            page,
            limit: 10,
            country: appliedFilters.location,
            workMode: appliedFilters.workMode,
            jobType: appliedFilters.jobType,
            remoteScope: appliedFilters.remoteScope,
            sort: semanticSort,
          });

          setJobs(data.jobs);

          setPagination({
            currentPage: data.page ?? page,
            totalPages: data.totalPages ?? 1,
            hasNextPage: data.hasNextPage ?? false,
            hasPreviousPage: data.hasPreviousPage ?? false,
          });
          return;
        }

        // --------------------------------------------------
        // Normal Keyword Search
        // --------------------------------------------------
        const data: JobsResponse = await fetchJobs({
          page,
          limit: 10,
          keyword: appliedFilters.keyword,
          location: appliedFilters.location,
          workMode: appliedFilters.workMode,
          jobType: appliedFilters.jobType,
          remoteScope: appliedFilters.remoteScope,
          sort: appliedFilters.sort,
        });

        setJobs(data.jobs);

        setPagination({
          currentPage: page,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPreviousPage: data.hasPreviousPage,
        });
      } catch (error) {
        console.error(error);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [appliedFilters, page]);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------
  const handleSearch = () => {
    setRagAnswer("");
setRagError("");
    const newFilters = {
      keyword,
      location,
      workMode,
      jobType,
      remoteScope,
      sort,
      searchMode,
    };

    sessionStorage.setItem(
  "jobSearchState",
  JSON.stringify({
    keyword,
    location,
    workMode,
    jobType,
    remoteScope,
    sort,
    searchMode,
    page: 1,
  })
);

    setPage(1);
    setAppliedFilters(newFilters);

    const params = new URLSearchParams();

    if (keyword) {
      params.set("keyword", keyword);
    }

    if (location) {
      params.set("location", location);
    }

    if (workMode) {
      params.set("workMode", workMode);
    }

    if (jobType) {
      params.set("jobType", jobType);
    }

    if (remoteScope) {
      params.set("remoteScope", remoteScope);
    }

    if (sort) {
      params.set("sort", sort);
    }

    params.set("searchMode", searchMode);
    params.set("page", "1");

    setSearchParams(params);
  };

const handleAskAI = async () => {
  if (!appliedFilters.keyword.trim()) {
    return;
  }

  try {
    setRagLoading(true);
    setRagError("");
    setRagAnswer("");

    const data = await fetchRagJobs({
      q: appliedFilters.keyword,
      country: appliedFilters.location,
      workMode: appliedFilters.workMode,
      jobType: appliedFilters.jobType,
      remoteScope:
        appliedFilters.remoteScope,
    });

    setRagAnswer(
      data.answer || ""
    );
    setRagContextJobs(
  data.contextJobsUsed || 0
);
  } catch (error) {
    console.error(
      "RAG request failed:",
      error
    );

    setRagError(
      "Failed to generate AI insights. Please try again."
    );
  } finally {
    setRagLoading(false);
  }
};

  // --------------------------------------------------
  // Clear Filters
  // --------------------------------------------------
  const handleClear = () => {
    setRagAnswer("");
setRagError("");

    sessionStorage.removeItem("jobSearchState");
    setPage(1);

    setKeyword("");
    setLocation("");
    setWorkMode("");
    setJobType("");
    setRemoteScope("");
    setSort("latest");
    setSearchMode("keyword");

    setAppliedFilters({
      keyword: "",
      location: "",
      workMode: "",
      jobType: "",
      remoteScope: "",
      sort: "latest",
      searchMode: "keyword",
    });

    setSearchParams({});
  };

  // --------------------------------------------------
  // Previous Page
  // --------------------------------------------------
  const handlePreviousPage = () => {
    if (!pagination.hasPreviousPage) {
      return;
    }

    const newPage = pagination.currentPage - 1;

    sessionStorage.setItem(
  "jobSearchState",
  JSON.stringify({
    ...appliedFilters,
    page: newPage,
  })
);

    setPage(newPage);

    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));

    setSearchParams(params);
  };

  // --------------------------------------------------
  // Next Page
  // --------------------------------------------------
  const handleNextPage = () => {
    if (!pagination.hasNextPage) {
      return;
    }

    const newPage = pagination.currentPage + 1;

sessionStorage.setItem(
  "jobSearchState",
  JSON.stringify({
    ...appliedFilters,
    page: newPage,
  })
);
    setPage(newPage);

    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));

    setSearchParams(params);
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50">

      {/* =================================================
          NAVBAR
      ================================================= */}
      <header className="sticky top-0 z-30 border-b border-blue-300/30 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 shadow-lg shadow-blue-900/10 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-4">

            {/* Brand */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex shrink-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg text-white shadow-sm ring-1 ring-white/20 backdrop-blur transition group-hover:scale-105 group-hover:bg-white/20">
                💼
              </div>

              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Job Aggregator
                </h1>

                <p className="text-xs text-blue-100">
                  Find your next opportunity
                </p>
              </div>
            </button>

            {/* Right side */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">

              {authLoading ? (
                <div className="rounded-xl bg-white/10 px-4 py-2 text-sm text-blue-50">
                  Loading...
                </div>
              ) : user ? (
                <>
                  {/* User identity */}
                  <div className="hidden items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2 shadow-sm backdrop-blur sm:flex">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-bold text-blue-700 shadow-sm">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-blue-100">
                        Welcome back
                      </p>

                      <p
                        className="max-w-[180px] truncate text-sm font-bold text-white"
                        title={user.name}
                      >
                        {user.name}
                      </p>
                    </div>
                  </div>

                  {/* Mobile user avatar */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-bold text-blue-700 shadow-sm sm:hidden"
                    title={user.name}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  {/* Desktop navigation */}
                  <div className="hidden items-center gap-1 lg:flex">
                    <button
                      type="button"
                      onClick={() => navigate("/saved-jobs")}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-blue-50 transition hover:bg-white/15 hover:text-white"
                    >
                      <span>⭐</span>
                      Saved Jobs
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/applications")}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-blue-50 transition hover:bg-white/15 hover:text-white"
                    >
                      <span>📋</span>
                      Applications
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/resume")}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-blue-50 transition hover:bg-white/15 hover:text-white"
                    >
                      <span>📄</span>
                      Resume
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/profile")}
                      className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
                    >
                      <span>👤</span>
                      Profile
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="cursor-pointer rounded-xl border border-red-200/50 bg-red-500/15 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-500/25"
                    >
                      Logout
                    </button>
                  </div>

                  {/* Compact navigation */}
                  <div className="flex items-center gap-1 lg:hidden">
                    <button
                      type="button"
                      onClick={() => navigate("/saved-jobs")}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-base text-white transition hover:bg-white/20"
                      title="Saved Jobs"
                    >
                      ⭐
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/applications")}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-base text-white transition hover:bg-white/20"
                      title="Applications"
                    >
                      📋
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/resume")}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-base text-white transition hover:bg-white/20"
                      title="Resume"
                    >
                      📄
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/profile")}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base text-blue-700 transition hover:bg-blue-50"
                      title="Profile"
                    >
                      👤
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200/40 bg-red-500/15 text-base text-white transition hover:bg-red-500/25"
                      title="Logout"
                    >
                      ↪
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="cursor-pointer rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
                  >
                    Sign Up
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Search */}
        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-md shadow-blue-900/5">
          <JobSearch
            searchMode={searchMode}
            onSearchModeChange={setSearchMode}
            keyword={keyword}
            location={location}
            workMode={workMode}
            jobType={jobType}
            remoteScope={remoteScope}
            sort={sort}
            onSortChange={setSort}
            onSearch={handleSearch}
            onClear={handleClear}
            onKeywordChange={setKeyword}
            onLocationChange={setLocation}
            onWorkModeChange={setWorkMode}
            onJobTypeChange={setJobType}
            onRemoteScopeChange={setRemoteScope}
          />
        </div>

        {/* =================================================
            AI JOB ASSISTANT
        ================================================= */}
        {user && jobs.length > 0 && (
          <div className="mt-6">
            <AiJobAssistant
              jobIds={jobs
                .slice(0, 5)
                .map((job) => job._id)}
            />
          </div>
        )}

        {/* =================================================
            JOBS HEADER
        ================================================= */}
        <div className="mb-6 mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Opportunities
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {appliedFilters.searchMode === "semantic"
                ? "Semantic Job Matches"
                : "Latest Jobs"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {jobs.length} jobs displayed
            </p>
          </div>

          {jobs.length > 0 && (
            <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm sm:block">
              Page {pagination.currentPage} of{" "}
              {pagination.totalPages}
            </div>
          )}
        </div>

        {/* =================================================
            RAG / AI JOB INSIGHTS
        ================================================= */}
        {appliedFilters.searchMode === "semantic" &&
          appliedFilters.keyword.trim() &&
          jobs.length > 0 && (
            <div className="mb-6">
              {!ragAnswer && !ragLoading && (
                <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>

                        <h3 className="font-bold text-slate-900">
                          Want AI insights?
                        </h3>
                      </div>

                      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                        Ask AI to explain the most relevant jobs
                        found for your search.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAskAI}
                      className="shrink-0 cursor-pointer rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={ragLoading}
                    >
                      ✨ Ask AI About These Jobs
                    </button>
                  </div>
                </div>
              )}

              {ragLoading && (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      ✨
                    </div>

                    <div>
                      <p className="font-semibold text-indigo-900">
                        AI is analyzing the relevant jobs...
                      </p>

                      <p className="mt-1 text-sm text-indigo-700">
                        Using the retrieved jobs to generate a grounded response.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {ragError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="font-medium text-red-700">
                    {ragError}
                  </p>

                  <button
                    type="button"
                    onClick={handleAskAI}
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {ragAnswer && (
                <RagAnswer
                  answer={ragAnswer}
                  contextJobsUsed={ragContextJobs}
                  onClose={() => {
                    setRagAnswer("");
                    setRagError("");
                    setRagContextJobs(0);
                  }}
                />
              )}
            </div>
          )}

        {/* Jobs List */}
        <div>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                ⏳
              </div>

              <p className="mt-4 font-medium text-slate-700">
                Loading jobs...
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Finding the latest opportunities for you.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                ⚠️
              </div>

              <p className="mt-4 font-semibold text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={handleClear}
                className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Try Again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🔎
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No jobs found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try changing your search criteria or clearing
                the filters to discover more opportunities.
              </p>

              <button
                type="button"
                onClick={handleClear}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="rounded-2xl transition hover:-translate-y-0.5"
                >
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && jobs.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={!pagination.hasPreviousPage}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Previous
              </button>

              <span
                className="min-w-[110px] rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-center text-sm font-semibold text-blue-700"
                aria-label={`Page ${pagination.currentPage} of ${pagination.totalPages}`}
              >
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Jobs;
