const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const path = require("path");
const routes = require("./routes");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(mongoSanitize());
app.use(compression());

const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3002",
  process.env.CLIENT_URL_LOCAL,
  process.env.CLIENT_ADMIN_URL_LOCAL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("CORS not allowed"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (_, res) =>
  res.json({ status: "ok", time: new Date() }),
);
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
