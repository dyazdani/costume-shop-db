import express from "express";

const app = express();

app.get("/", (req, res, next): void => {
    try {
        res.send("Hello World");
    } catch (error) {
        next(error);
    }
})

const {PORT = 3000} = process.env;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})