const verifyToken = require("./auth/verifyToken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const router = require("express").Router();

router.post("/:id", verifyToken, async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user.id;
  let likeStatus = false;

  try {
    const postExist = await prisma.post.findFirst({
      where: {
        id: postId,
        deleted: false,
      },
    });

    if (!postExist) {
      return res.status(400).json({ message: "post not found" });
    }
    const like = await prisma.like.findFirst({
      where: {
        userId,
      },
    });
    if (like === null) {
      await prisma.like.create({
        data: {
          Post: {
            connect: {
              id: postId,
            },
          },
          User: {
            connect: {
              id: userId,
            },
          },
        },
      });
      likeStatus = true;
    } else {
      await prisma.like.delete({
        where: {
          id: like.id,
        },
      });
      likeStatus = false;
    }
    res.status(200).json({
      message: `Post ${likeStatus ? "liked" : "unliked"} successfully`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
