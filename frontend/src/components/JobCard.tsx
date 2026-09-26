"use client";

import type { Job } from "./JobsGrid";

type JobCardProps = {
  job: Job;
  onClaim: (jobId: number) => void;
};

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function JobCard({ job, onClaim }: JobCardProps) {
  const isOpen = job.status === "open";

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{job.title}</h2>
        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
            job.status === "open"
              ? "bg-emerald-100 text-emerald-700"
              : job.status === "claimed"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-200 text-slate-700",
          ].join(" ")}
        >
          {job.status}
        </span>
      </div>

      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
        {job.description}
      </p>

      <div className="mt-auto border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Created</span>
          <span>{formatDate(job.created_at)}</span>
        </div>

        {isOpen ? (
          <button
            type="button"
            onClick={() => onClaim(job.id)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Claim
          </button>
        ) : (
          <div className="mt-4 text-sm font-medium text-slate-500">
            {job.status === "claimed" ? "Job claimed" : "Job closed"}
          </div>
        )}
      </div>
    </article>
  );
}
