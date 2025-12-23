//the router file for the users api
const express = require("express");
const router = express.Router();
const users = require("../controllers/users");
const verifyjwt = require("../middleware/verifyJwt");
const loginLimiter = require("../middleware/loginLimiter");
router.use(loginLimiter);
// router.use(verifyjwt)
router
  .route("/")
  .get(verifyjwt, users.getallUsers)
  .post(users.createNewUser)
  .delete(verifyjwt, users.deleteUser);
// .patch(users.updateuser)//update method

router.route("/employee").post(verifyjwt, users.createEmployee);

router.route("/employees").get(verifyjwt, users.getAllEmployees);

router
  .route("/profile")
  .get(verifyjwt, users.getUserProfile)
  .patch(verifyjwt, users.updateUserProfile);
router
  .route("/:id")
  .patch(users.updateuser)
  .get(users.getUser)
  .delete(verifyjwt, users.deleteUser);

module.exports = router;
