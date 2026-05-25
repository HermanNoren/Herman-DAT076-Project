import express from "express";
import cors from "cors";
import { lockSystemRouter } from "./router/lock-system";
import { keyRouter } from "./router/key";
import { orderRouter } from "./router/order";
import { userRouter } from "./router/user";

export const app = express();

app.use(express.json());
app.use(cors());

app.use("/lock-systems", lockSystemRouter);
app.use("/keys", keyRouter);
app.use("/orders", orderRouter);
app.use("/users", userRouter);
