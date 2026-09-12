import { fetchAiJobAssistant } from "../../services/jobApi";
import { useState } from "react";
interface AiJobAssistantProps {
  jobIds: string[];
}

const AiJobAssistant = ({ jobIds }: AiJobAssistantProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    if (jobIds.length === 0) {
      setError("There are no jobs available for AI analysis.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");

      const data = await fetchAiJobAssistant(
        trimmedQuestion,
        jobIds.slice(0, 5)
      );

      setAnswer(data.answer || "No answer was returned.");
    } catch (err) {
      console.error("AI assistant error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate AI assistant response"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          🤖 AI Job Assistant
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Ask questions about the jobs currently shown on this page.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAsk();
            }
          }}
          placeholder="Which job is the best fit for me?"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          disabled={loading}
        />

        <button
          type="button"
          onClick={handleAsk}
          disabled={loading || !question.trim() || jobIds.length === 0}
          className="rounded-lg cursor-pointer  bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>

      {jobIds.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">
          Search for jobs first to use the AI assistant.
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-5 rounded-lg bg-gray-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            AI Answer
          </h3>

          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

export default AiJobAssistant;