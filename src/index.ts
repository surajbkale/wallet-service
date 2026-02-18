import express from "express";
import "./db/index.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "server is healthy",
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on the http://localhost:${PORT}`);
});
