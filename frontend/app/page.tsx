"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import sampleJobsData from "../../sample_json_data/jobs.json";
import JobsGrid, { type Job } from "../src/components/JobsGrid";

const initialJobs: Job[] =
  (sampleJobsData as { jobs?: Job[] }).jobs ?? [];

export default function Home() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${apiUrl}/jobs`);

        const payload = response.data;

        if (Array.isArray(payload)) {
          setJobs(payload);
          return;
        }

        if (
          payload &&
          typeof payload === "object" &&
          Array.isArray((payload as { jobs?: Job[] }).jobs)
        ) {
          setJobs((payload as { jobs: Job[] }).jobs);
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

        <JobsGrid jobs={jobs} />
      </div>
    </main>
  );
}
