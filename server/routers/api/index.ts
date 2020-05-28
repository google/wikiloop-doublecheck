import actionRouter from "~/server/routers/api/action";
import {feedRouter} from "~/server/routers/api/feed";
import scoreRouter from "~/server/routers/api/score";
import { metricsRouter } from "./metrics";

const express = require('express');

export const apiRouter = express.Router();

apiRouter.use(`/action`, actionRouter);
apiRouter.use(`/feed`, feedRouter);
apiRouter.use(`/metrics`, metricsRouter);
if (process.env.STIKI_MYSQL) {
  const scoreRouter = require("./routes/score").scoreRouter;
  apiRouter.use(`/api/score`, scoreRouter);
}
