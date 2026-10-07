"use client";

import { useState } from "react";
import JobCard from "./JobCard";

export type JobStatus = "open" | "claimed" | "closed";

export type Job = {
  id: number;
  title: string;
  description: string;
  category: string;
  zipCode: string;
  status: JobStatus;
  homeownerId: number;
  providerId: number | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type JobsGridProps = {
  jobs: Job[];
};

export default function JobsGrid({ jobs }: JobsGridProps) {
  const [jobList, setJobList] = useState<Job[]>(jobs.filter((job) => job.status !== "closed"));

  const handleClaim = (jobId: number) => {
    setJobList((currentJobs) =>
      currentJobs
        .map((job): Job =>
          job.id === jobId
            ? {
                ...job,
                providerId: 1,
                status: "claimed",
                updated_at: new Date(),
              }
            : job,
        )
        .filter((job) => job.status !== "closed"),
    );
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {jobList.map((job) => (
        <JobCard key={job.id} job={job} onClaim={handleClaim} />
      ))}
    </div>
  );
}
