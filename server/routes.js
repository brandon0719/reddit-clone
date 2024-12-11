// routes/main.routes.js
import { Router } from "express";
import MainController from "./controllers.js";
import UserController from "./userController.js";
import jwtAuth from "./jwtAuth.js";

const router = Router();

// Community Routes
router.route("/communities")
    .get(MainController.getAllCommunities)
    .post(jwtAuth, MainController.addOneCommunity) // auth required

router.route("/communities/:id")
    .get(MainController.getOneCommunity)
    .put(jwtAuth, MainController.updateCommunity) // auth required
    .delete(jwtAuth, MainController.deleteCommunity); // auth required

router.post("/communities/:id/join", jwtAuth, MainController.joinCommunity); // auth required
router.post("/communities/:id/leave", jwtAuth, MainController.leaveCommunity); // auth required

// Post Routes
router.route("/posts")
    .get(MainController.getAllPosts)
    .post(jwtAuth, MainController.addOnePost); // auth required

router.route("/posts/:id")
    .get(MainController.getOnePost)
    .put(MainController.updatePost) // auth required
    .delete(jwtAuth, MainController.deletePost); // auth required

router.patch("/posts/:id/views", MainController.incrementPostViews);

router.post('/posts/:id/vote', jwtAuth, MainController.voteOnPost); // auth required

// Comment Routes
router
    .route("/comments")
    .get(MainController.getAllComments)
    .post(jwtAuth, MainController.addOneComment); // auth required

router.route("/comments/:id")
    .get(MainController.getOneComment)
    .put(jwtAuth, MainController.updateComment) // auth required
    .delete(jwtAuth, MainController.deleteComment); // auth required

router.post("/comments/:id/vote", jwtAuth, MainController.voteOnComment);

// LinkFlair Routes
router
    .route("/linkFlairs")
    .get(MainController.getAllLinkFlairs)
    .post(jwtAuth, MainController.addOneLinkFlair); // auth required

router.route("/linkFlairs/:id")
    .get(MainController.getOneLinkFlair);

// User Routes
router.post("/register", UserController.register);
router.post("/login", UserController.login);

router.get("/users", jwtAuth, MainController.getAllUsers);
router.get("/communities?createdBy=:id", jwtAuth, MainController.getCommunitiesByUser);
router.get("/posts?postedBy=:id", jwtAuth, MainController.getPostsByUser);
router.get("/comments?commentedBy=:id", jwtAuth, MainController.getCommentsByUser);
router.delete("/users/:id/:displayName", jwtAuth, MainController.deleteUser);

export default router;
