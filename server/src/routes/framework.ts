import { Router } from "express";
import type { Lang } from "../../../shared/types.js";
import { localizeFramework, localizeRoleProfiles } from "../lib/framework.js";
import { runFidelityCheck } from "../lib/fidelityCheck.js";

export const frameworkRouter = Router();

function langFromQuery(q: unknown): Lang {
  return q === "tr" ? "tr" : "en";
}

frameworkRouter.get("/framework", (req, res) => {
  res.json(localizeFramework(langFromQuery(req.query.lang)));
});

frameworkRouter.get("/role-profiles", (req, res) => {
  res.json(localizeRoleProfiles(langFromQuery(req.query.lang)));
});

frameworkRouter.get("/fidelity", (_req, res) => {
  res.json(runFidelityCheck());
});
