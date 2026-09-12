import { useSearchParams, useNavigate } from "react-router-dom";
import type { Job } from "../../types/job";

interface JobCardProps {
  job: Job;
}

const getPostedTime = (postedAt: string | null) => {
  if (!postedAt) {
    return "Posting date unavailable";
  }

  const postedDate = new Date(postedAt);
  const now = new Date();

  const differenceInSeconds = Math.floor(
    (now.getTime() - postedDate.getTime()) / 1000
  );

  if (differenceInSeconds < 60) {
    return "Posted just now";
  }

  const differenceInMinutes = Math.floor(differenceInSeconds / 60);

  if (differenceInMinutes < 60) {
    return `Posted ${differenceInMinutes} ${
      differenceInMinutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  const differenceInHours = Math.floor(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return `Posted ${differenceInHours} ${
      differenceInHours === 1 ? "hour" : "hours"
    } ago`;
  }

  const differenceInDays = Math.floor(differenceInHours / 24);

  if (differenceInDays < 7) {
    return `Posted ${differenceInDays} ${
      differenceInDays === 1 ? "day" : "days"
    } ago`;
  }

  const differenceInWeeks = Math.floor(differenceInDays / 7);

  if (differenceInWeeks < 4) {
    return `Posted ${differenceInWeeks} ${
      differenceInWeeks === 1 ? "week" : "weeks"
    } ago`;
  }

  const differenceInMonths = Math.floor(differenceInDays / 30);

  if (differenceInMonths < 12) {
    return `Posted ${differenceInMonths} ${
      differenceInMonths === 1 ? "month" : "months"
    } ago`;
  }

  const differenceInYears = Math.floor(differenceInDays / 365);

  return `Posted ${differenceInYears} ${
    differenceInYears === 1 ? "year" : "years"
  } ago`;
};

const JobCard = ({ job }: JobCardProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const detailsUrl = `/jobs/${job._id}?${searchParams.toString()}`;

  const semanticMatchPercentage =
    typeof job.score === "number"
      ? Math.round(job.score * 100)
      : null;

  return (
    <div className="mb-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">

      {/* Job Title */}
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {job.title}
        </h2>

        {/* Semantic Match Score */}
        {semanticMatchPercentage !== null && (
          <span className="w-fit shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
            ✨ {semanticMatchPercentage}% semantic match
          </span>
        )}
      </div>

      {/* Company */}
      <p className="mb-3 font-medium text-gray-700">
        {job.company}
      </p>

      {/* Location */}
      <p className="mb-3 text-gray-600">
        📍{" "}
        {job.city
          ? `${job.city}${job.country ? `, ${job.country}` : ""}`
          : "Remote"}
      </p>

      {/* Posted Time */}
      <p className="mb-3 text-sm text-gray-500">
        🕐 {getPostedTime(job.postedAt)}
      </p>

      {/* Job Information */}
      <div className="mb-4 flex flex-wrap gap-2">

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

      {/* Salary */}
      {(job.salary.min !== null || job.salary.max !== null) && (
        <p className="mb-4 font-medium text-gray-700">
          💰{" "}
          {job.salary.min !== null && job.salary.max !== null
            ? `${job.salary.currency} ${job.salary.min} - ${job.salary.max}`
            : job.salary.min !== null
              ? `${job.salary.currency} ${job.salary.min}+`
              : `Up to ${job.salary.currency} ${job.salary.max}`}
        </p>
      )}

      {/* Description */}
      <p className="mb-4 line-clamp-3 text-gray-600">
        {job.description}
      </p>

      {/* Skills */}
      {job.skills.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {job.skills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Section */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">

        <p className="text-sm text-gray-500">
          Source: {job.source}
        </p>

        <div className="flex gap-3">

          {/* View Details */}
          <button
            onClick={() => {
              sessionStorage.setItem(
                "returningFromJobDetails",
                "true"
              );

              navigate(detailsUrl);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
          >
            View Details
          </button>

          {/* Apply */}
          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 cursor-pointer"
            >
              Apply Now ↗
            </a>
          )}

        </div>
      </div>
    </div>
  );
};

export default JobCard;