import express from "express";
import cors from "cors";
import dotEnv from "dotenv";
import authRoutes from "./routes/auth";
import errorHandler from "./controllers/error/error";

dotEnv.config();

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

//Auth Routes
app.use(authRoutes);

//Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] : Server started at http://localhost:${PORT}`);
});
