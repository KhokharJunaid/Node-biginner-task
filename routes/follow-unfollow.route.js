const verifyToken = require("./auth/verifyToken");
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/:id", verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    if (id === userId) {
      return res.status(401).json({ message: "you could not follow yourself" });
    }

    const userExist = await prisma.user.findFirst({
      where: {
        id,
        deleted: false,
      },
    });
    if (!userExist) {
      return res.status(400).json({ message: "User not found" });
    }

    // checking already followed or not
    const follow = await prisma.follow.findFirst({
      where: {
        followerId: userId,
        followingId: id,
      },
    });
    if (follow) {
      await prisma.follow.delete({
        where: {
          id: follow.id,
        },
      });
    } else {
      await prisma.follow.create({
        data: {
          follower: {
            connect: {
              id: userId,
            },
          },
          following: {
            connect: {
              id,
            },
          },
        },
      });
    }
    res.status(200).json({
      message: follow ? "Unfollowed successfully" : "followed successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
