"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import sampleJobsData from "../../sample_json_data/jobs.json";
import JobsGrid, { type Job } from "../src/components/JobsGrid";

const initialJobs: Job[] = (sampleJobsData as { jobs?: Job[] }).jobs ?? [];

const normalizeJob = (job: Record<string, unknown>): Job => ({
  id: Number(job.id ?? 0),
  title: String(job.title ?? ""),
  description: String(job.description ?? ""),
  category: String(job.category ?? ""),
  zipCode: String(job.zipCode ?? job.zipcode ?? job.zip_code ?? ""),
  status: (job.status as Job["status"]) ?? "open",
  homeownerId: Number(job.homeownerId ?? job.homeowner_id ?? 0),
  providerId:
    job.providerId != null
      ? Number(job.providerId)
      : job.provider_id != null
        ? Number(job.provider_id)
        : null,
  created_at: (job.created_at as Job["created_at"]) ?? new Date(),
  updated_at: (job.updated_at as Job["updated_at"]) ?? new Date(),
});

export default function Home() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${apiUrl}/jobs`);
        const payload = response?.data;

        if (Array.isArray(payload)) {
          setJobs((payload as Record<string, unknown>[]).map(normalizeJob));
          return;
        }

        if (
          payload &&
          typeof payload === "object" &&
          Array.isArray((payload as { jobs?: unknown[] }).jobs)
        ) {
          setJobs(
            ((payload as { jobs: Record<string, unknown>[] }).jobs ?? []).map(
              normalizeJob,
            ),
          );
          return;
        }

        setJobs(initialJobs);
      } catch (error) {
        console.error("Could not load jobs from the backend:", error);
        setJobs(initialJobs);
      }
    };

    void fetchJobs();
  }, [apiUrl]);

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

        <JobsGrid key={jobs.map((job) => job.id).join("-")} jobs={jobs} />
      </div>
    </main>
  );
}
