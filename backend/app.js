require("dotenv").config();
const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();

const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
const path = require("path");

mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://" +
      process.env.DB_USER_NAME +
      ":" +
      process.env.DB_USER_PASSWORD +
      "@" +
      process.env.DB_NAME +
      ".mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
