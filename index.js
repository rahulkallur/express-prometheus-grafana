const express = require("express");

const app = express();

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
    return res.json({message:"Hello from Express Server"});
});

app.get("/slow", async (req, res) => {});

app.listen(PORT, () => {
  console.log(`Express Server Started at http://localhost:${PORT}`);
});
