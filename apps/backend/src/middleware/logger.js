import { randomUUID } from "node:crypto";

export function logger(req, res, next) {
  const requestId = req.headers["x-request-id"] || randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  console.log(JSON.stringify({
    level: "info",
    event: "request",
    requestId,
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  }));

  next();
}