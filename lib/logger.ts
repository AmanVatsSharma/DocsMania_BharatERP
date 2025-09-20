type LogLevel = "debug" | "info" | "warn" | "error";

function log(level: LogLevel, message: string, meta?: unknown) {
  const payload = { level, message, meta, ts: new Date().toISOString() };
  if (process.env.NODE_ENV === "production") {
    // JSON logs
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload));
  } else {
    // Pretty console in dev
    const fn = level === "debug" ? console.debug : level === "info" ? console.info : level === "warn" ? console.warn : console.error;
    fn(`[${payload.ts}] ${level.toUpperCase()}: ${message}`, meta ?? "");
  }
}

export const logger = {
  debug: (m: string, meta?: unknown) => log("debug", m, meta),
  info: (m: string, meta?: unknown) => log("info", m, meta),
  warn: (m: string, meta?: unknown) => log("warn", m, meta),
  error: (m: string, meta?: unknown) => log("error", m, meta),
};

export default logger;

