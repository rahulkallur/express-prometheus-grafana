const express = require("express");
const client = require("prom-client");
const { doSomeHeavyTask } = require("./util");

const app = express();

const PORT = process.env.PORT || 8000;

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register });

app.get("/", (req, res) => {
  return res.json({ message: "Hello from Express Server" });
});

app.get("/slow", async (req, res) => {
  try {
    const timeTaken = await doSomeHeavyTask();
    return res.json({
      status: "Success",
      message: `Heavy Task completed in ${timeTaken} ms`,
    });
  } catch (err) {
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
