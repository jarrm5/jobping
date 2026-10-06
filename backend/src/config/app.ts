import express, { type Express, type Request, type Response } from "express";
import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { configureCors } from "./cors.ts";
import createJobsRouter from "../routes/jobs.ts";

export function createApp(prisma: PrismaClient): Express {
  const app = express();

  configureCors(app);
  app.use(express.json());

  app.get("/", async (req: Request, res: Response) => {
    res.status(200).json({ message: "Welcome to the JobPinggggg API!!!" });
  });

  app.use("/jobs", createJobsRouter(prisma));

  return app;
}
