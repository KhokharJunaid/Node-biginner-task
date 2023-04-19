const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../../validation");

const prisma = new PrismaClient();

router.post("/register", async (req, res, next) => {
  const { username, email, password } = req.body;
  // validating user
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  //   checking user already exists
  const emailExisted = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (emailExisted)
    return res.status(400).json({ message: "Email already exists" });

  // hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const createdUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // creating token and assigning
    const token = jwt.sign({ id: createdUser.id }, process.env.TOKEN_SECRET);
    res.header("auth-token", token).status(200).json(createdUser);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  // validating user data
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  //   checking whehter the user exists
  const userExisted = await prisma.user.findUnique({ where: { email } });
  if (!userExisted) return res.status(400).json({ message: "Email not found" });

  //   checking the password
  const validPassword = await bcrypt.compare(password, userExisted.password);
  if (!validPassword)
    return res.status(400).json({ message: "password is incorrect" });

  // creating token and assigning
  const token = jwt.sign({ id: userExisted.id }, process.env.TOKEN_SECRET);

  res
    .header("auth-token", token)
    .status(200)
    .json({ message: "login successfull", token });
  try {
  } catch (error) {
    next(error);
  }
});

module.exports = router;
