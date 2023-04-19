const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("./auth/verifyToken");

const prisma = new PrismaClient();

router.post("/", verifyToken, async (req, res, next) => {
  const { title, description } = req.body;
  const userId = req.user.id;
  try {
    const createPost = await prisma.post.create({
      data: {
        title,
        description,
        author: {
          connect: {
            id: userId,
          },
        },
      },
    });
    res.status(200).json(createPost);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        deleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        likes: true,
      },
    });
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const postExists = await prisma.post.findFirst({
      where: {
        id,
        deleted: false,
      },
    });
    if (!postExists) {
      return res.status(404).json({ message: "post not found" });
    }
    const post = await prisma.post.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        likes: true,
      },
    });
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
});

router.patch("/edit/:id", verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const postExists = await prisma.post.findFirst({
      where: {
        id,
        deleted: false,
      },
    });
    if (!postExists) {
      return res.status(404).json({ message: "post not found" });
    }
    await prisma.post.update({
      where: {
        id,
      },
      data: {
        title,
        description,
      },
    });
    res.status(200).json({ message: "post updated successfully" });
  } catch (error) {
    next(error);
  }
});

router.delete("/delete/:id", verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const postExists = await prisma.post.findFirst({
      where: {
        id,
        deleted: false,
      },
    });
    if (!postExists) {
      return res.status(404).json({ message: "post not found" });
    }

    if (postExists.authorId === userId) {
      await prisma.post.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
      });
    } else {
      return res.status(401).json({ message: "you are not allowed" });
    }

    await prisma.like.deleteMany({
      where: {
        postId: id,
      },
    });
    return res.status(200).json({ message: "post deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
