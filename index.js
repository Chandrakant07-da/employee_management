const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const routes = require("./routes/routes");
const cookieParser = require("cookie-parser");

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
    .connect(process.env.DB_CONNECT, {useNewUrlParser: true })
    .then(() => {
        console.log("Database connected");
    })
    .catch((error) => console.log(error));

app.use(
    express.json(),
    cors(),
    cookieParser()
);

app.use("/", routes);