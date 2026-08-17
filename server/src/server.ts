import "dotenv/config";
import express from "express";
import cors from "cors";
import { frameworkRouter } from "./routes/framework.js";
import { sessionRouter } from "./routes/session.js";
import { adminRouter } from "./routes/admin.js";
import { llmAvailable } from "./engine/llmService.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, llmEnabled: llmAvailable(), adminEnabled: Boolean(process.env.ADMIN_TOKEN) });
});

app.use("/api", frameworkRouter);
app.use("/api", sessionRouter);
app.use("/api", adminRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`RM Comp assessment server listening on http://localhost:${PORT}`);
  console.log(`LLM-assisted evidence evaluation: ${llmAvailable() ? "ENABLED" : "disabled (set ANTHROPIC_API_KEY to enable)"}`);
  console.log(`Admin dashboard: ${process.env.ADMIN_TOKEN ? "ENABLED at /admin" : "disabled (set ADMIN_TOKEN to enable)"}`);
});
