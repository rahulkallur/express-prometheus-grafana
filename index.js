const express = require("express");
const { doSomeHeavyTask } = require("./util");

const app = express();

const PORT = process.env.PORT || 8000;

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

app.listen(PORT, () => {
  console.log(`Express Server Started at http://localhost:${PORT}`);
});
