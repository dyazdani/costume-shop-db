import express, { Request, Response, NextFunction } from "express";
import path from "path";

const app = express();

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.send("index.html");
  } catch (error) {
    next(error);
  }
});

import apiRouter from "./api";
app.use("/api", apiRouter)

app.use((req, res): void => {
  res.status(404)
  .send({ message: "Invalid Route"})
})

app.use((error: Error, req: Request, res: Response, next: NextFunction):void => {
  res.status(500)
  .send({ message: "Oops! Server Error" })
})

const{PORT = 3000} = process.env;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});