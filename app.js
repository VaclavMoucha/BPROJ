const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const articlesRouter = require("./routes/articles");
const pagesRouter = require("./routes/pages");
const authRouter = require("./routes/auth");
const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB připojeno"))
  .catch((err) => console.error(err));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "res")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use("/api/articles", articlesRouter);
app.use("/", pagesRouter);
app.use("/api", authRouter);
module.exports = app;
