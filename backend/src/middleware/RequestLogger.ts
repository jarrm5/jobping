import fs from "node:fs";
import path from "node:path";
import type { Request, Response, NextFunction } from "express";

const logDirectory = "/app/logs";
const logFile = path.join(logDirectory, "requests.log");

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
    };

    fs.appendFile(logFile, JSON.stringify(logEntry) + "\n", (error) => {
      if (error) {
        console.error("Failed to write request log:", error);
      }
    });
  });

  next();
}
