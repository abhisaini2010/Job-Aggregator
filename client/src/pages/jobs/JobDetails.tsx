import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  fetchJobById,
  fetchJobMatch,
  type JobMatchResult,
} from "../../services/jobApi";
import type { Job } from "../../types/job";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";


type ApplicationStatus =
  | "Applied"
  | "Interview"
  | "Rejected"
  | "Offer";

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [jobMatch, setJobMatch] = useState<JobMatchResult | null>(null);
const [matchLoading, setMatchLoading] = useState(false);
const [matchError, setMatchError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Application state
  const [isApplied, setIsApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus>("Applied");
  const [applying, setApplying] = useState(false);

  // --------------------------------------------------
  // Load Job
  // --------------------------------------------------
  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setError("Job ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await fetchJobById(id);

        setJob(data.job);
      } catch (error) {
        console.error(error);
        setError("Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);
useEffect(() => {
  const loadJobMatch = async () => {
    if (!id || !user) {
      setJobMatch(null);
      return;
    }

    try {
      setMatchLoading(true);
      setMatchError("");

      const data = await fetchJobMatch(id);

      setJobMatch(data.match);
    } catch (error) {
      console.error("Failed to load job match:", error);
      setMatchError("Unable to calculate job match");
    } finally {
      setMatchLoading(false);
    }
  };

  loadJobMatch();
}, [id, user]);
  // --------------------------------------------------
  // Check whether job is already saved
  // --------------------------------------------------
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!user || !id) {
        setIsSaved(false);
        return;
      }

      try {
const response = await api.get("/jobs/saved");

        const savedJobs = response.data.jobs || [];

        const alreadySaved = savedJobs.some(
          (savedJob: Job) => savedJob._id === id
        );

        setIsSaved(alreadySaved);
      } catch (error) {
        console.error(
          "Failed to check saved status:",
          error
        );
      }
    };

    checkSavedStatus();
  }, [user, id]);

  // --------------------------------------------------
  // Check whether job is already applied
  // --------------------------------------------------
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || !id) {
        setIsApplied(false);
        return;
      }

      try {
        const response = await api.get("/applications");

        const applications = response.data.applications || [];

        const application = applications.find(
          (item: {
            job: Job | string;
            status: ApplicationStatus;
          }) => {
            const jobId =
              typeof item.job === "string"
                ? item.job
                : item.job?._id;

            return jobId === id;
          }
        );

        if (application) {
          setIsApplied(true);
          setApplicationStatus(application.status);
        } else {
          setIsApplied(false);
          setApplicationStatus("Applied");
        }
      } catch (error) {
        console.error(
          "Failed to check application status:",
          error
        );
      }
    };

    checkApplicationStatus();
  }, [user, id]);

  // --------------------------------------------------
  // Save / Unsave Job
  // --------------------------------------------------
  const handleSaveJob = async () => {
  if (!user) {
    navigate("/login");
    return;
  }

  if (!id) {
    return;
  }

  try {
    setSaving(true);

    if (isSaved) {
      await api.delete(`/jobs/${id}/save`);

      setIsSaved(false);
    } else {
      await api.post(`/jobs/${id}/save`);

      setIsSaved(true);
    }
  } catch (error) {
    console.error("Save job error:", error);
  } finally {
    setSaving(false);
  }
};

  // --------------------------------------------------
  // Mark Job as Applied
  // --------------------------------------------------
  const handleApplyTracking = async () => {
  if (!user) {
    navigate("/login");
    return;
  }

  if (!id) {
    return;
  }

  if (isApplied) {
    navigate("/applications");
    return;
  }

  try {
    setApplying(true);

    await api.post("/applications", {
      jobId: id,
      notes: "",
    });

    setIsApplied(true);
    setApplicationStatus("Applied");
  } catch (error: any) {
    console.error(
      "Application tracking error:",
      error
    );

    if (
      error.response?.status === 400 &&
      error.response?.data?.message
    ) {
      alert(error.response.data.message);
    } else {
      alert("Failed to track application");
    }
  } finally {
    setApplying(false);
  }
};

  // --------------------------------------------------
  // Back to Jobs
  // --------------------------------------------------
  const handleBackToJobs = () => {
    const page = searchParams.get("page") || "1";

    const params = new URLSearchParams();

    const keyword = searchParams.get("keyword");
    const location = searchParams.get("location");
    const workMode = searchParams.get("workMode");
    const jobType = searchParams.get("jobType");
    const remoteScope = searchParams.get("remoteScope");
    const sort = searchParams.get("sort");

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

    params.set("page", page);

    sessionStorage.setItem(
      "returningFromJobDetails",
      "true"
    );

    navigate(`/?${params.toString()}`);
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-gray-600">
            Loading job...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-white p-10 text-center">
          <p className="text-red-600">
            {error || "Job not found"}
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Job Details
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-8">

        {/* Back Button */}
        <button
          onClick={handleBackToJobs}
          className="mb-4 cursor-pointer rounded-lg bg-blue-200 p-2 font-medium text-blue-500 hover:text-blue-800"
        >
          ← Back to Jobs
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          {/* Job Title */}
          <h2 className="text-3xl font-bold text-gray-900">
            {job.title}
          </h2>

          {/* Company */}
          <p className="mt-2 text-lg font-medium text-gray-700">
            {job.company}
          </p>

          {/* Location */}
          <p className="mt-4 text-gray-600">
            📍{" "}
            {job.city
              ? `${job.city}${
                  job.country
                    ? `, ${job.country}`
                    : ""
                }`
              : "Remote"}
          </p>

          {/* Job Information */}
          <div className="mt-5 flex flex-wrap gap-2">

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
              {job.jobType}
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
              {job.workMode}
            </span>

            {job.remoteScope !== "Not applicable" && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
                🌎 {job.remoteScope}
              </span>
            )}

          </div>

          {/* Description */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="mb-3 text-xl font-semibold text-gray-900">
              Job Description
            </h3>

            <p className="whitespace-pre-line text-gray-600">
              {job.description}
            </p>
          </div>

{/* Job Match */}
{user && (
  <div className="mt-8 border-t border-gray-100 pt-6">
    <h3 className="mb-4 text-xl font-semibold text-gray-900">
      Your Job Match
    </h3>

    {matchLoading && (
      <div className="rounded-lg bg-gray-50 p-6 text-center">
        <p className="text-gray-600">
          Calculating your match...
        </p>
      </div>
    )}

    {matchError && !matchLoading && (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">
          {matchError}
        </p>
      </div>
    )}

    {jobMatch && !matchLoading && (
      <div className="space-y-5">

        {/* Match Score */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
          <p className="text-sm font-medium text-blue-700">
            Match Score
          </p>

          <p className="mt-2 text-5xl font-bold text-blue-600">
            {jobMatch.matchScore}%
          </p>
        </div>

        {/* Skills */}
        <div className="rounded-lg border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900">
            Skills
          </h4>

          <p className="mt-1 text-sm text-gray-500">
            {jobMatch.skills.matchedCount} of{" "}
            {jobMatch.skills.requiredCount} required skills matched
          </p>

          {jobMatch.skills.matched.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-green-700">
                Matched Skills
              </p>

              <div className="flex flex-wrap gap-2">
               {jobMatch.skills.matched.map((skill) => (
  <span
    key={skill}
    className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-700"
  >
    ✓ {skill}
  </span>
))}
              </div>
            </div>
          )}

          {jobMatch.skills.missing.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-red-700">
                Missing Skills
              </p>

              <div className="flex flex-wrap gap-2">
               {jobMatch.skills.missing.map((skill) => (
  <span
    key={skill}
    className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700"
  >
    ○ {skill}
  </span>
))}
              </div>
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="rounded-lg border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900">
            Experience
          </h4>

          <p
            className={`mt-2 text-sm ${
              jobMatch.experience.compatible
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {jobMatch.experience.compatible
              ? "✓ Compatible"
              : "✗ Not fully compatible"}
          </p>

          {jobMatch.experience.requiredYears > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              Job requires approximately{" "}
              {jobMatch.experience.requiredYears} year(s);
              you have {jobMatch.experience.userYears}.
            </p>
          )}
        </div>

        {/* Education */}
        <div className="rounded-lg border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900">
            Education
          </h4>

          <p
            className={`mt-2 text-sm ${
              jobMatch.education.compatible
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {jobMatch.education.compatible
              ? "✓ Compatible"
              : "✗ May not match"}
          </p>
        </div>

        {/* Work Mode */}
        <div className="rounded-lg border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900">
            Work Mode
          </h4>

          <p
            className={`mt-2 text-sm ${
              jobMatch.workMode.compatible
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {jobMatch.workMode.compatible
              ? "✓ Compatible"
              : "✗ Does not match your preference"}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Job: {jobMatch.workMode.jobWorkMode}
          </p>
        </div>

        {/* Location */}
        <div className="rounded-lg border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900">
            Location
          </h4>

          <p
            className={`mt-2 text-sm ${
              jobMatch.location.compatible
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {jobMatch.location.compatible
              ? "✓ Compatible"
              : "✗ Location may not match"}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Your country:{" "}
            {jobMatch.location.userCountry || "Not specified"}
          </p>

          <p className="text-sm text-gray-500">
            Job country:{" "}
            {jobMatch.location.jobCountry ||
              "Not specified"}
          </p>
        </div>

        {/* Explanation */}
        {jobMatch.explanation && (
          <div className="rounded-lg bg-gray-50 p-5">
            <h4 className="font-semibold text-gray-900">
              Why this score?
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {jobMatch.explanation}
            </p>
          </div>
        )}
      </div>
    )}
  </div>
)}

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">

              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Skills
              </h3>

              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>

            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-100 pt-6">

            {/* Save Job */}
            <button
              onClick={handleSaveJob}
              disabled={saving}
              className={`cursor-pointer rounded-lg px-6 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isSaved
                  ? "border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "border border-blue-600 bg-white text-blue-600 hover:bg-blue-50"
              }`}
            >
              {saving
                ? "Saving..."
                : isSaved
                  ? "⭐ Saved"
                  : "☆ Save Job"}
            </button>

            {/* Application Tracking */}
            <button
              onClick={handleApplyTracking}
              disabled={applying}
              className={`cursor-pointer rounded-lg px-6 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isApplied
                  ? "border border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {applying
                ? "Tracking..."
                : isApplied
                  ? `✓ Applied — ${applicationStatus}`
                  : "Mark as Applied"}
            </button>

            {/* Apply */}
            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block cursor-pointer rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Apply Now ↗
              </a>
            )}

          </div>

          {/* Application Tracker Link */}
          {isApplied && (
            <div className="mt-4">
              <button
                onClick={() => navigate("/applications")}
                className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all my applications →
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default JobDetails;