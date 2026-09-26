"use client";

import JobsGrid, { type Job } from "../src/components/JobsGrid";

const initialJobs: Job[] = [
  {
    id: 1,
    title: "Fix kitchen sink leak",
    description:
      "Replace worn-out faucet supply lines and tighten the drain connection to stop the water leak under the sink.",
    category: "Plumbing",
    zipCode: "10001",
    status: "open",
    homeownerId: 42,
    providerId: null,
    created_at: "2026-09-20T09:00:00.000Z",
    updated_at: "2026-09-20T09:00:00.000Z",
  },
  {
    id: 2,
    title: "Paint bedroom wall",
    description:
      "Two accent walls need prep, patching, and a fresh coat of warm white paint before move-in.",
    category: "Painting",
    zipCode: "10002",
    status: "claimed",
    homeownerId: 51,
    providerId: 1,
    created_at: "2026-09-22T13:30:00.000Z",
    updated_at: "2026-09-24T16:15:00.000Z",
  },
  {
    id: 3,
    title: "Install ceiling fan",
    description:
      "Mount a ceiling fan in the bedroom and wire it to the existing switch for improved airflow.",
    category: "Electrical",
    zipCode: "10005",
    status: "closed",
    homeownerId: 66,
    providerId: 2,
    created_at: "2026-09-15T08:45:00.000Z",
    updated_at: "2026-09-17T11:20:00.000Z",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
            Available jobs
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Jobs
          </h1>
        </header>

        <JobsGrid jobs={initialJobs} />
      </div>
    </main>
  );
}
