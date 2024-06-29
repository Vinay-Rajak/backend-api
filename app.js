const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const sharp = require("sharp");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./module/usermodel");
const faculty = require("./module/Faculty");
const placementData = require("./module/placementData");
const multer = require("multer");
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

// Set up memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
  if (req.cookies.token == undefined) res.render("login");
  else res.redirect("/profile");
});
app.post("/verify", async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findOne({ username });
  if (user) {
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        let token = jwt.sign({ username, email: user.email }, "shccccccccccc");
        res.cookie("token", token, { httpOnly: true, expiresIn: "1h" });

        res.redirect("/profile");
      } else res.send(" the password is wrong ..");
    });
  } else res.send("some thing wend worng");
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.get("/profile", isLogIn, async (req, res) => {
  let data = await userModel
    .findOne({ username: req.user.username })
    .select("-password -_id -__v ");
  // res.json(proData);
  //const base64Image = data.image.toString("base64"); use this for conveting the buffer data into image
  // in the image tag , {src = 'data: data.imageType : base64, base64Image'}
  // res.render("profile", { data, image: base64Image });
  res.json(data);
});

app.get("/updatePro", isLogIn, async (req, res) => {
  const data = await userModel
    .findOne({ username: req.user.username })
    .select("-password -_id -__v");
  res.render("updatePro", data);
});
app.post("/updataUserDb", isLogIn, upload.single("file"), async (req, res) => {
  console.log(req.file.buffer);
  const { name, passoutYear } = req.body;
  const user = await userModel.findOneAndUpdate(
    { username: req.user.username },
    { name, passoutYear },
  );
  user.image = req.file.buffer;
  user.imageType = req.file.mimetype;
  await user.save();
  res.redirect("/profile");
});

function isLogIn(req, res, next) {
  if (req.cookies.token === undefined) res.redirect("/login");
  else {
    jwt.verify(req.cookies.token, "shccccccccccc", function (err, decoded) {
      req.user = decoded;
    });
    next();
  }
}

app.listen(port, () => console.log("server is running"));
