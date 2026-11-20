require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();
const origins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);
app.use(cors({ origin: origins.length ? origins : "*" }));
app.use(express.json());

app.get("/", (req, res) =>
  res.json({
    name: "LearnHub API",
    status: "running",
    docs: "See /api/health and /api/courses",
  }),
);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", async (req, res, next) => {
  if (!process.env.JWT_SECRET)
    return res
      .status(500)
      .json({ message: "Server misconfigured: JWT_SECRET is not set" });
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB error:", err.message);
    res.status(500).json({
      message:
        "Database connection failed. Check MONGO_URI and Atlas network access.",
    });
  }
});
app.use("/api", routes);

const dist = path.join(__dirname, "../client/dist");
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) =>
    res.sendFile(path.join(dist, "index.html")),
  );
}

app.use("/api", notFound);
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
