import { useEffect, useState } from "react";
import api from "../../services/api";

interface ParsedResumeData {
  name: string;
  skills: string[];
  experience: { years: number; roles: string[] };
  education: { degree: string; field: string };
  jobTitles: string[];
  projects: string[];
}

interface ResumeData {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  extractedText: string;
  parsedData: ParsedResumeData;
  createdAt: string;
  updatedAt?: string;
}

const Resume = () => {
  const [file, setFile] = useState<File | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await api.get("/resumes");
        setResume(response.data.resume);
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          console.error("Failed to fetch resume:", error);
        }
      }
    };

    fetchResume();
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("Resume must be smaller than 5 MB.");
      setFile(null);
      return;
    }

    setMessage("");
    setFile(selectedFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF resume first.");
      return;
    }

    try {
      setIsUploading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("resume", file);

      const response = await api.post("/resumes/upload", formData);

      setResume(response.data.resume);
      setMessage(
        response.data.profileUpdated
          ? "Resume uploaded and profile updated successfully."
          : response.data.message || "Resume uploaded successfully."
      );
      setFile(null);
    } catch (error: any) {
      console.error("Resume upload error:", error);
      setMessage(
        error?.response?.data?.message || "Failed to upload resume."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const parsed = resume?.parsedData;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <span>✦</span>
                Resume Intelligence
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Your Resume
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Upload your resume once and let Job Aggregator extract your
                skills, education, experience and projects for smarter job
                matching.
              </p>
            </div>

            {resume && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                  ✓
                </span>
                Resume connected
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Upload Card */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
                  ↑
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {resume ? "Update your resume" : "Upload your resume"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    PDF only · Maximum 5 MB
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-slate-200">
                  📄
                </div>

                <h3 className="mt-4 font-semibold text-slate-800">
                  Drop your resume here
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  or click anywhere to choose a PDF file
                </p>

                <p className="mt-4 text-xs text-slate-400">
                  Your resume will be parsed automatically after upload.
                </p>
              </div>

              {file && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                      📑
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-3 rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-white hover:text-slate-800"
                  >
                    Remove
                  </button>
                </div>
              )}

              {message && (
                <div
                  className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                    message.toLowerCase().includes("successfully")
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading
                  ? "Processing your resume..."
                  : resume
                    ? "Replace Resume"
                    : "Upload Resume"}
              </button>
            </div>
          </section>

          {/* Current Resume Summary */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-semibold text-slate-900">
                Resume overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Information currently extracted from your resume.
              </p>
            </div>

            {resume && parsed ? (
              <div className="p-6">
                <div className="rounded-2xl bg-slate-900 p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Current file
                      </p>
                      <h3 className="mt-1 truncate text-lg font-semibold">
                        {resume.originalName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatFileSize(resume.fileSize)} · PDF
                      </p>
                    </div>
                    <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200">
                      Active
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-slate-900">
                      {parsed.skills.length}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Skills detected
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-slate-900">
                      {parsed.projects.length}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Projects detected
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Education</span>
                    <span className="max-w-[60%] text-right font-medium text-slate-800">
                      {parsed.education.degree || "Not detected"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Experience</span>
                    <span className="font-medium text-slate-800">
                      {parsed.experience.years} years
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last uploaded</span>
                    <span className="font-medium text-slate-800">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  📄
                </div>
                <h3 className="mt-4 font-semibold text-slate-800">
                  No resume uploaded yet
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Upload a PDF and your extracted information will appear here.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Parsed Resume Details */}
        {resume && parsed && (
          <section className="mt-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Extracted information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Parsed details that can be used throughout your job search.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Skills */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Skills</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {parsed.skills.length} detected
                    </p>
                  </div>
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    Skills
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {parsed.skills.length > 0 ? (
                    parsed.skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No skills detected.
                    </p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                    🎓
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Education</h3>
                    <p className="text-xs text-slate-500">
                      Academic background
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Degree
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {parsed.education.degree || "Not detected"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Field
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {parsed.education.field || "Not detected"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    💼
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Experience</h3>
                    <p className="text-xs text-slate-500">
                      Roles detected from your resume
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-4 inline-flex rounded-xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {parsed.experience.years}
                      </p>
                      <p className="text-xs text-slate-500">years</p>
                    </div>
                  </div>

                  {parsed.experience.roles.length > 0 ? (
                    <div className="space-y-2">
                      {parsed.experience.roles.map((role, index) => (
                        <div
                          key={`${role}-${index}`}
                          className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                        >
                          {role}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No experience roles detected.
                    </p>
                  )}
                </div>
              </div>

              {/* Projects */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    🚀
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Projects</h3>
                    <p className="text-xs text-slate-500">
                      Projects detected from your resume
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {parsed.projects.length > 0 ? (
                    parsed.projects.map((project, index) => (
                      <div
                        key={`${project}-${index}`}
                        className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                      >
                        <span className="mr-2 text-slate-400">0{index + 1}</span>
                        {project}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No projects detected.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Resume;
