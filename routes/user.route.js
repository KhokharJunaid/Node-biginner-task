const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const verifyToken = require("./auth/verifyToken");

const prisma = new PrismaClient();

router.get("/", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        deleted: false,
      },
      include: {
        posts: true,
        likes: true,
        followers: true,
        following: true,
      },
    });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        posts: true,
        likes: true,
        followers: true,
        following: true,
      },
    });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

router.patch("/edit/:id", verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const { username, password } = req.body;

  // hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const editUser = await prisma.user.update({
      where: {
        id,
        deleted: false,
      },
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(200).json(editUser);
  } catch (err) {
    next(err);
  }
});

router.delete("/delete/:id", verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (id === userId) {
    try {
      const userExists = await prisma.user.findFirst({
        where: {
          id,
          deleted: false,
        },
      });
      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: {
          deleted: false,
          // deleted: true,
        },
      });

      console.log("updatedUser===>", updatedUser);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  } else {
    return res
      .status(401)
      .json({ message: "you are not allowed to delete other user" });
  }
});

module.exports = router;
