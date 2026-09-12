import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getProfile,
  updateProfile,
} from "../services/profileApi";

import type { UserProfile } from "../services/profileApi";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // LOAD PROFILE
  // =========================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProfile();

        setProfile(data);
      } catch (error) {
        console.error("Profile loading error:", error);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // =========================
  // UPDATE FIELD
  // =========================
  const updateField = (
    section: keyof UserProfile,
    value: any
  ) => {
    setProfile((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [section]: value,
      };
    });
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const updatedProfile = await updateProfile({
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        location: profile.location,
        preferences: profile.preferences,
      });

      setProfile(updatedProfile);

      setMessage("Profile updated successfully.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Profile update error:", error);

      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
            👤
          </div>

          <p className="mt-4 font-medium text-slate-700">
            Loading your profile...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Getting your career information ready.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            ← Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const skillCount = profile.skills?.length || 0;
  const roleCount =
    profile.experience?.roles?.length || 0;

  const experienceYears =
    profile.experience?.years || 0;

  const educationCount =
    profile.education?.degree ||
    profile.education?.field
      ? 1
      : 0;

  const primaryRole =
    profile.experience?.roles?.[0] ||
    "Frontend Developer";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =========================
          TOP NAVIGATION
      ========================= */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center justify-between gap-4">
            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
                💼
              </div>

              <span className="hidden text-xl font-bold text-slate-900 sm:block">
                JobPortal
              </span>
            </button>

            {/* Navigation */}
            <nav className="hidden items-center gap-1 md:flex">
              <button
                onClick={() => navigate("/")}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                💼 Jobs
              </button>

              <button
                onClick={() => navigate("/saved-jobs")}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                ⭐ Saved Jobs
              </button>

              <button
                onClick={() => navigate("/applications")}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                📋 Applications
              </button>

              <button
                onClick={() => navigate("/resume")}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                📄 Resume
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
              >
                👤 Profile
              </button>
            </nav>

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                {profile.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {profile.name}
                </p>

                <p className="text-xs text-slate-500">
                  Career Profile
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* =========================
            HERO PROFILE CARD
        ========================= */}
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-white shadow-sm">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl font-bold text-white shadow-lg sm:h-28 sm:w-28">
                    {profile.name?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </div>

                  <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-white shadow-sm">
                    📷
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Your Career Profile
                  </p>

                  <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    {profile.name}
                  </h1>

                  <p className="mt-1 text-lg font-medium text-slate-600">
                    {primaryRole}
                  </p>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Keep your profile updated to get more
                    relevant job matches and recommendations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("career-profile")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        </section>

        {/* =========================
            STATS
        ========================= */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                {"</>"}
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {skillCount}
                </p>

                <p className="text-sm text-slate-500">
                  Skills Added
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-xl">
                💼
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {experienceYears}
                </p>

                <p className="text-sm text-slate-500">
                  Years of Experience
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                🎓
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {educationCount}
                </p>

                <p className="text-sm text-slate-500">
                  Education Record
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-xl">
                🎯
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {roleCount}
                </p>

                <p className="text-sm text-slate-500">
                  Roles / Interests
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            PROFILE CONTENT
        ========================= */}
        <div
          id="career-profile"
          className="mt-6 space-y-6"
        >
          {/* ACCOUNT INFORMATION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  👤
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Account Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your basic account details
                  </p>
                </div>
              </div>

              <span className="rounded-lg bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                Account
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Name
                </p>

                <p className="mt-2 text-base font-semibold text-slate-900">
                  {profile.name}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-2 break-all text-base font-semibold text-slate-900">
                  {profile.email}
                </p>
              </div>
            </div>
          </section>

          {/* SKILLS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  🧠
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Skills
                  </h2>

                  <p className="text-sm text-slate-500">
                    Technologies and skills you currently know
                  </p>
                </div>
              </div>

              <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {skillCount} skills
              </span>
            </div>

            <input
              type="text"
              value={profile.skills.join(", ")}
              onChange={(e) =>
                updateField(
                  "skills",
                  e.target.value
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                )
              }
              placeholder="React, JavaScript, TypeScript, Node.js"
              className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No skills added yet.
                </p>
              )}
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Separate skills using commas.
            </p>
          </section>

          {/* EXPERIENCE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
                  💼
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Experience
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your professional experience and roles
                  </p>
                </div>
              </div>

              <span className="rounded-lg bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                Career
              </span>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[180px_1fr]">
              <div className="rounded-2xl bg-violet-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-violet-500">
                  Experience
                </p>

                <p className="mt-2 text-4xl font-bold text-slate-900">
                  {profile.experience.years}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  years
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Years of experience
                </label>

                <input
                  type="number"
                  min="0"
                  value={profile.experience.years}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      experience: {
                        ...profile.experience,
                        years: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                <label className="mt-5 block text-sm font-semibold text-slate-700">
                  Previous roles
                </label>

                <input
                  type="text"
                  value={profile.experience.roles.join(", ")}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      experience: {
                        ...profile.experience,
                        roles: e.target.value
                          .split(",")
                          .map((role) => role.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="Frontend Developer, Software Intern"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                <div className="mt-4 space-y-2">
                  {profile.experience.roles.length > 0 ? (
                    profile.experience.roles.map(
                      (role, index) => (
                        <div
                          key={`${role}-${index}`}
                          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
                            💼
                          </div>

                          <span className="text-sm font-medium text-slate-700">
                            {role}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-slate-500">
                      No roles added yet.
                    </p>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Separate roles using commas.
                </p>
              </div>
            </div>
          </section>

          {/* EDUCATION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  🎓
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Education
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your educational background
                  </p>
                </div>
              </div>

              <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Academic
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Degree
                </label>

                <input
                  type="text"
                  value={profile.education.degree}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        degree: e.target.value,
                      },
                    })
                  }
                  placeholder="Bachelor of Technology"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Field of study
                </label>

                <input
                  type="text"
                  value={profile.education.field}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      education: {
                        ...profile.education,
                        field: e.target.value,
                      },
                    })
                  }
                  placeholder="Computer Science & Engineering"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>
          </section>

          {/* LOCATION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-xl">
                  📍
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Location
                  </h2>

                  <p className="text-sm text-slate-500">
                    Where you are currently based
                  </p>
                </div>
              </div>

              <span className="rounded-lg bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                Location
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  City
                </label>

                <input
                  type="text"
                  value={profile.location.city}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      location: {
                        ...profile.location,
                        city: e.target.value,
                      },
                    })
                  }
                  placeholder="Panipat"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Country
                </label>

                <input
                  type="text"
                  value={profile.location.country}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      location: {
                        ...profile.location,
                        country: e.target.value,
                      },
                    })
                  }
                  placeholder="India"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>
          </section>

          {/* JOB PREFERENCES */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-xl">
                  🎯
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Job Preferences
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your preferred job search settings
                  </p>
                </div>
              </div>

              <span className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                Preferences
              </span>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="rounded-2xl bg-rose-50/70 p-5">
                <div className="text-xl">💼</div>

                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Preferred Job Types
                </p>

                <input
                  type="text"
                  value={profile.preferences.jobTypes.join(
                    ", "
                  )}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        jobTypes: e.target.value
                          .split(",")
                          .map((type) => type.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="Full-time, Internship"
                  className="mt-2 w-full rounded-xl border border-white bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-rose-300"
                />
              </div>

              <div className="rounded-2xl bg-violet-50/70 p-5">
                <div className="text-xl">💻</div>

                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Preferred Work Mode
                </p>

                <input
                  type="text"
                  value={profile.preferences.workModes.join(
                    ", "
                  )}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        workModes: e.target.value
                          .split(",")
                          .map((mode) => mode.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="Remote, Hybrid"
                  className="mt-2 w-full rounded-xl border border-white bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-violet-300"
                />
              </div>

              <div className="rounded-2xl bg-blue-50/70 p-5">
                <div className="text-xl">🌍</div>

                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Remote Scope
                </p>

                <select
                  value={profile.preferences.remoteScope}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        remoteScope: e.target.value,
                      },
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-white bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-300"
                >
                  <option value="">
                    Select remote scope
                  </option>

                  <option value="Worldwide">
                    Worldwide
                  </option>

                  <option value="Country">
                    Country
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* MESSAGES */}
          {message && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700">
              <span className="text-lg">✓</span>

              <div>
                <p className="font-semibold">
                  Changes saved
                </p>

                <p className="mt-0.5 text-sm">
                  {message}
                </p>
              </div>
            </div>
          )}

          {error && profile && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              <span className="text-lg">!</span>

              <div>
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="mt-0.5 text-sm">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <section className="grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving Changes..."
                : "💾 Save Profile Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/saved-jobs")}
              className="rounded-2xl border border-blue-200 bg-white px-5 py-4 font-semibold text-slate-700 shadow-sm transition hover:bg-blue-50"
            >
              ⭐ View Saved Jobs
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-red-200 bg-white px-5 py-4 font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
            >
              🚪 Logout
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;