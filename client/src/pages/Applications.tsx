import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import type { Job } from "../types/job";

interface Application {
  _id: string;
  job: Job|null;
  status: "Applied" | "Interview" | "Rejected" | "Offer";
  appliedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = "http://localhost:5000/api/applications";

const Applications = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<
  "All" | Application["status"]
>("All");
const [searchQuery, setSearchQuery] = useState("");

  // =========================
  // FETCH APPLICATIONS
  // =========================
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        withCredentials: true,
      });

      setApplications(response.data.applications);
    } catch (error) {
      console.error(error);
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CHECK AUTH + FETCH
  // =========================
  useEffect(() => {
    if (!authLoading && user) {
      fetchApplications();
    }

    if (!authLoading && !user) {
      setLoading(false);
      navigate("/login");
    }
  }, [authLoading, user]);

  // =========================
  // UPDATE STATUS
  // =========================
  const handleStatusChange = async (
    applicationId: string,
    status: Application["status"]
  ) => {
    try {
      await axios.patch(
        `${API_URL}/${applicationId}/status`,
        { status },
        {
          withCredentials: true,
        }
      );

      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          application._id === applicationId
            ? {
                ...application,
                status,
              }
            : application
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update application status");
    }
  };

  // =========================
  // DELETE APPLICATION
  // =========================
  const handleDelete = async (applicationId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${applicationId}`, {
        withCredentials: true,
      });

      setApplications((previousApplications) =>
        previousApplications.filter(
          (application) => application._id !== applicationId
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete application");
    }
  };

// =========================
// FILTER APPLICATIONS
// =========================
const filteredApplications = applications.filter(
  (application) => {
    const matchesStatus =
      statusFilter === "All" ||
      application.status === statusFilter;

    const query = searchQuery.toLowerCase().trim();

    // Application may refer to a job that no longer exists.
    if (!application.job) {
      return matchesStatus && !query;
    }

    const matchesSearch =
      !query ||
      application.job.title
        .toLowerCase()
        .includes(query) ||
      application.job.company
        .toLowerCase()
        .includes(query) ||
      (application.job.location || "")
        .toLowerCase()
        .includes(query);

    return matchesStatus && matchesSearch;
  }
);
  // =========================
  // LOADING
  // =========================
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading applications...
        </p>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="flex items-center justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Applications
              </h1>

              <p className="mt-1 text-gray-600">
                Track the jobs you have applied for
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

{/* Application Summary */}
{applications.length > 0 && (
  <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">

    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">
        Total
      </p>

      <p className="mt-1 text-2xl font-bold text-gray-900">
        {applications.length}
      </p>
    </div>

    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
      <p className="text-sm text-yellow-700">
        Applied
      </p>

      <p className="mt-1 text-2xl font-bold text-yellow-800">
        {
          applications.filter(
            (application) =>
              application.status === "Applied"
          ).length
        }
      </p>
    </div>

    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm text-blue-700">
        Interviews
      </p>

      <p className="mt-1 text-2xl font-bold text-blue-800">
        {
          applications.filter(
            (application) =>
              application.status === "Interview"
          ).length
        }
      </p>
    </div>

    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
      <p className="text-sm text-green-700">
        Offers
      </p>

      <p className="mt-1 text-2xl font-bold text-green-800">
        {
          applications.filter(
            (application) =>
              application.status === "Offer"
          ).length
        }
      </p>
    </div>

    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">
        Rejected
      </p>

      <p className="mt-1 text-2xl font-bold text-red-800">
        {
          applications.filter(
            (application) =>
              application.status === "Rejected"
          ).length
        }
      </p>
    </div>

  </div>
)}

{/* Status Filter */}
{/* Search and Status Filter */}
{applications.length > 0 && (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

    {/* Search */}
    <div className="w-full sm:max-w-md">
      <label
        htmlFor="application-search"
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        Search applications
      </label>

      <input
        id="application-search"
        type="text"
        value={searchQuery}
        onChange={(e) =>
          setSearchQuery(e.target.value)
        }
        placeholder="Search by job title, company or location"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
      />
    </div>

    {/* Status Filter */}
    <div className="flex items-center gap-3">
      <label
        htmlFor="status-filter"
        className="text-sm font-medium text-gray-700"
      >
        Filter:
      </label>

      <select
        id="status-filter"
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(
            e.target.value as
              | "All"
              | Application["status"]
          )
        }
        className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
      >
        <option value="All">
          All Statuses
        </option>

        <option value="Applied">
          Applied
        </option>

        <option value="Interview">
          Interview
        </option>

        <option value="Rejected">
          Rejected
        </option>

        <option value="Offer">
          Offer
        </option>
      </select>
    </div>

  </div>
)}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-white p-5 text-red-600">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!error && applications.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <h2 className="text-xl font-semibold text-gray-900">
              No applications yet
            </h2>

            <p className="mt-2 text-gray-500">
              Jobs you mark as applied will appear here.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 cursor-pointer rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Find Jobs
            </button>

          </div>
        )}

        {/* Applications */}
        <div className="space-y-5">

         <div className="space-y-5">

  {filteredApplications.length === 0 ? (
    <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">

      <h2 className="text-xl font-semibold text-gray-900">
        No matching applications
      </h2>

      <p className="mt-2 text-gray-500">
        Try changing your search or filter.
      </p>

      <button
        onClick={() => {
          setSearchQuery("");
          setStatusFilter("All");
        }}
        className="mt-5 cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
      >
        Clear Search & Filter
      </button>

    </div>
  ) : (
    filteredApplications.map((application) => {
  const job = application.job;

  // The application still exists, but the original job
  // has been deleted from the database.
  if (!job) {
    return (
      <div
        key={application._id}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                📄
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Job no longer available
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  This job has been removed from the job database,
                  but your application record is still available.
                </p>
              </div>
            </div>
          </div>

          <span
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              application.status === "Applied"
                ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                : application.status === "Interview"
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : application.status === "Rejected"
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-green-300 bg-green-50 text-green-700"
            }`}
          >
            {application.status}
          </span>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-5">
          <p className="text-sm text-gray-500">
            Applied on{" "}
            {new Date(
              application.appliedAt
            ).toLocaleDateString()}
          </p>

          {application.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">
                Notes
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {application.notes}
              </p>
            </div>
          )}

          <button
            onClick={() =>
              handleDelete(application._id)
            }
            className="mt-5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Remove Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      key={application._id}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {/* Job Information */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {job.title}
          </h2>

          <p className="mt-1 font-medium text-gray-700">
            {job.company}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            📍{" "}
            {job.city
              ? `${job.city}${
                  job.country
                    ? `, ${job.country}`
                    : ""
                }`
              : "Remote"}
          </p>
        </div>

        <button
          onClick={() =>
            navigate(`/jobs/${job._id}`)
          }
          className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          View Job
        </button>
      </div>

      {/* Application Details */}
      <div className="mt-5 border-t border-gray-100 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-600">
            Status:
          </span>

          <select
            value={application.status}
            onChange={(e) =>
              handleStatusChange(
                application._id,
                e.target.value as Application["status"]
              )
            }
            className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium outline-none ${
              application.status === "Applied"
                ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                : application.status === "Interview"
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : application.status === "Rejected"
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-green-300 bg-green-50 text-green-700"
            }`}
          >
            <option value="Applied">
              Applied
            </option>

            <option value="Interview">
              Interview
            </option>

            <option value="Rejected">
              Rejected
            </option>

            <option value="Offer">
              Offer
            </option>
          </select>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Applied on{" "}
          {new Date(
            application.appliedAt
          ).toLocaleDateString()}
        </p>

        {application.notes && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">
              Notes
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {application.notes}
            </p>
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="mt-5 border-t border-gray-100 pt-5">
        <button
          onClick={() =>
            handleDelete(application._id)
          }
          className="cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Remove Application
        </button>
      </div>
    </div>
  );
})
  )}

</div>

        </div>
      </main>
    </div>
  );
};

export default Applications;