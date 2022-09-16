const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const routes = require("./routes/routes");

app = express();
dotenv.config();
const port = 4000;

app.get("/", (req, res) => {
    res.send("App is Running");
});

app.listen(port, () => {
    console.log(`App is running on port:  ${port}`);
});

mongoose
    .connect(process.env.DB_CONNECT)
    .then(() => {
        console.log("Database connected");
    })
    .catch((error) => console.log(error));
