import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import JobCard from "../components/jobs/JobCard";
import type { Job } from "../types/job";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Fetch Saved Jobs
  // --------------------------------------------------
  useEffect(() => {
    const loadSavedJobs = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get("/jobs/saved");

        setJobs(response.data.jobs || []);
      } catch (error) {
        console.error("Failed to load saved jobs:", error);

        setError("Failed to load saved jobs");
      } finally {
        setLoading(false);
      }
    };

    loadSavedJobs();
  }, [user, authLoading, navigate]);

  // --------------------------------------------------
  // Authentication Loading
  // --------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // Loading Saved Jobs
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-gray-600">
            Loading saved jobs...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-white p-10 text-center">
          <p className="text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Saved Jobs
              </h1>

              <p className="mt-1 text-gray-600">
                Jobs you've saved for later
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              ← Back to Jobs
            </button>

          </div>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-8">

        {/* Saved Jobs Count */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Your Saved Jobs
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {jobs.length}{" "}
            {jobs.length === 1 ? "job" : "jobs"} saved
          </p>
        </div>

        {/* Empty State */}
        {jobs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">

            <div className="text-5xl">
              ⭐
            </div>

            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              No saved jobs yet
            </h3>

            <p className="mt-2 text-gray-500">
              Save jobs you're interested in and
              they'll appear here.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 cursor-pointer rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Browse Jobs
            </button>

          </div>
        ) : (
          /* Saved Jobs List */
          <div>
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default SavedJobs;