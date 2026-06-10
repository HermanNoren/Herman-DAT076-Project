/**
 * Express application setup: JSON parsing, session middleware, CORS and
 * route mounting. The app is exported without listening so tests can drive
 * it with Supertest; `index.ts` starts the real server.
 */
import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import { lockSystemRouter } from "./router/lock-system";
import { keyRouter } from "./router/key";
import { orderRouter } from "./router/order";
import { userRouter } from "./router/user";
import { sessionRouter } from "./router/session";

dotenv.config();

if (!process.env["SESSION_SECRET"]) {
  console.error("SESSION_SECRET is not set in .env");
  process.exit(1);
}

/** The configured Express application, shared by `index.ts` and the tests. */
export const app = express();

app.use(express.json());

app.use(
  session({
    secret: process.env["SESSION_SECRET"],
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(cors({ origin: true, credentials: true }));

app.use("/session", sessionRouter);
app.use("/lock-systems", lockSystemRouter);
app.use("/keys", keyRouter);
app.use("/orders", orderRouter);
app.use("/users", userRouter);
