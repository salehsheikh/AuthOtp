import express from "express";
import cors from "cors";
import morgan from "morgan";

import router from "./routes/route.js";
import connect from "./config/db.js";

// Set up global .env access

// Constants
const app = express();
const PORT = 8080;

// Middlewares
app.use(express.json());
app.use(cors);
// app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by");

// Route API
app.use("/api", router);

app.get("/", (req, res) => {
  res.status(201).json("HOME GET REQUEST");
});

// Start server only when we have valid connection
connect()
  .then(() => {
    try {
      app.listen(PORT, () => {
        console.log(`Server is listening on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.log("Cannot connect to the server...!");
    }
  })
  .catch((error) => {
    console.log("Invalid database connection...!", error);
  });
