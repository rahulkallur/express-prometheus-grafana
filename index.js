const express = require("express");
const client = require("prom-client");
const responseTime = require("response-time");
const { createLogger, transports } = require("winston");
const LokiTransport = require("winston-loki");
const { doSomeHeavyTask } = require("./util");

const options = {
  transports: [
    new LokiTransport({
      host: "http://127.0.0.1:3100",
    }),
  ],
};
const logger = createLogger(options);

const app = express();

const PORT = process.env.PORT || 8000;

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register });

const reqsTime = new client.Histogram({
  name: "http_express_req_res_time",
  help: "This tells how much time is taken by req and res",
  labelNames: ["method", "route", "status_code"],
  buckets: [1, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000],
});

const totalRequestCounter = new client.Counter({
  name: "total_req",
  help: "This tells how many times a request is made",
});

app.use(
  responseTime((req, res, time) => {
    totalRequestCounter.inc();
    reqsTime
      .labels({
        method: req.method,
        route: req.url,
        status_code: res.statusCode,
      })
      .observe(time);
  })
);

app.get("/", (req, res) => {
  logger.info("Request came on / route");
  return res.json({ message: "Hello from Express Server" });
});

app.get("/slow", async (req, res) => {
  logger.info("Request came on /slow route");
  try {
    const timeTaken = await doSomeHeavyTask();
    return res.json({
      status: "Success",
      message: `Heavy Task completed in ${timeTaken} ms`,
    });
  } catch (err) {
    logger.error(err.message);
    console.log("Error: ", err.toString());
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", client.register.contentType);

  const metrics = await client.register.metrics();

  res.send(metrics);
});

app.listen(PORT, () => {
  console.log(`Express Server Started at http://localhost:${PORT}`);
});
