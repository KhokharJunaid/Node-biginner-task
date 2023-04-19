const express = require("express");
const createError = require("http-errors");
const morgan = require("morgan");
require("dotenv").config();
const cors = require("cors");
const userRoute = require("./routes/user.route");
const postRoute = require("./routes/post.route");
const authRoute = require("./routes/auth/auth");
const likeUnlikeRoute = require("./routes/like-unlike.route");
const followUnFollow = require("./routes/follow-unfollow.route");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());

// import router
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/user/follow-unfollow", followUnFollow);
app.use("/post", postRoute);
app.use("/post/like-unlike", likeUnlikeRoute);

app.get("/", async (req, res, next) => {
  res.send({ message: "Awesome it works 🐻" });
});

app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
