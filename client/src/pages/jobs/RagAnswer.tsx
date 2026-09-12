interface RagAnswerProps {
  answer: string;
  contextJobsUsed: number;
  onClose: () => void;
}

const RagAnswer = ({
  answer,
  contextJobsUsed,
  onClose,
}: RagAnswerProps) => {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 shadow-md shadow-indigo-900/5">
      <div className="flex items-start justify-between gap-4 border-b border-indigo-100 px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              ✨
            </span>

            <div>
              <h3 className="font-bold text-slate-900">
                AI Job Insights
              </h3>

              <p className="text-xs text-slate-500">
                Based on {contextJobsUsed} retrieved jobs
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
          aria-label="Close AI answer"
        >
          ×
        </button>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <p className="whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">
          {answer}
        </p>
      </div>

      <div className="border-t border-indigo-100 bg-white/60 px-5 py-3 sm:px-6">
        <p className="text-xs text-slate-500">
          AI response generated from the jobs retrieved
          for your search.
        </p>
      </div>
    </div>
  );
};

export default RagAnswer;