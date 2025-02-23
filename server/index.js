import express from "express";
import cors from "cors";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import testRoutes from "./routes/tests.js";
import sessionRoutes from "./routes/sessions.js";
import assignRoutes from "./routes/assign.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

console.log("Registering routes...");

app.use("/api/auth", authRoutes);
console.log("Auth routes registered");

app.use("/api/tests", testRoutes);
console.log("Test routes registered");

app.use("/api/sessions", sessionRoutes);
console.log("Session routes registered");

app.use("/api/assign", assignRoutes);
console.log("Assign routes registered");

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
