const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const routes = require("./routes/routes");
const cookieParser = require("cookie-parser");

app = express();

const port = 4000;

app.listen(port, () => {
    console.log(`App is running on port:  ${port}`);
});

app.get("/", (req, res) => {
    res.send("App is Running");
});


mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.use(
    express.json(),
    cookieParser()
); 

app.use("/",routes);
