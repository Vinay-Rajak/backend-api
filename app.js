const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./module/usermodel");
const faculty = require("./module/Faculty");
const placementData = require("./module/placementData");
const port = process.env.PORT || 8000;

mongoose.connect(
  "mongodb+srv://data:data@cluster0.9rfsnp1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
);

app.set("view engine", "ejs");
app.use(cors({}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});
app.get("/test", (req, res) => {
  res.status(200).json("this is the data send from the backend .");
});

app.get("/faculty", async (req, res) => {
  let result = await faculty.find();
  res.status(200).json({ msg: result });
});
app.get("/placementData", async (req, res) => {
  let data = await placementData.find();
  res.status(200).json({ placementData: data });
});

app.get("/", (req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  const { username, email, password, name, passoutYear } = req.body;
  const user = await userModel.findOne({ username });
  if (user) {
    res.send("the user pre exist ,, Enter unique name ");
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        const user = await userModel.create({
          username,
          name,
          email,
          passoutYear,
          password: hash,
        });
        let token = jwt.sign({ username, email }, "shccccccccccc");
        res.cookie("token", token, { httpOnly: true, expiresIn: "1m" });
        res.send("the register is successfull !..");
      });
    });
  }
});

app.get("/login", (req, res) => {
  if (req.cookies.token == " " || req.cookies.token == undefined)
    res.render("login");
  else res.redirect("/pro");
});
app.post("/verify", async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findOne({ username });
  if (user) {
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        let token = jwt.sign({ username, email: user.email }, "shccccccccccc");
        res.cookie("token", token, { httpOnly: true, expiresIn: "1h" });

        res.redirect("/pro");
      } else res.send(" the password is wrong ..");
    });
  } else res.send("some thing wend worng");
});

app.get("/logout", (req, res) => {
  res.cookie("token", " ");
  res.redirect("/login");
});

app.get("/pro", isLogIn, (req, res) => {
  res.render("profile", req.user);
});

function isLogIn(req, res, next) {
  console.log(req.user);
  if (req.cookies["token"] == " " || req.cookies.token == undefined)
    res.redirect("/login");
  else {
    jwt.verify(req.cookies["token"], "shccccccccccc", function (err, decoded) {
      req.user = decoded;
    });
  }
  next();
}

app.listen(port, () => console.log("server is running"));
