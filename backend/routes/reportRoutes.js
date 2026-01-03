const express = require("express");
const router = express.Router();
const requestsController = require("../controllers/requests");
const verifyJwt = require("../middleware/verifyJwt");

router.use(verifyJwt);

// HR Request Management Routes
router
  .route("/")
  .post(requestsController.createRequest)
  .get(requestsController.getAllRequests);

router.route("/my").get(requestsController.getMyRequests);
router.route("/week").get(requestsController.getWeekSchedule);
router.route("/approved").get(requestsController.getApprovedRequests);
router.route("/weekly-wfh").get(requestsController.getWeeklyWFH);
router.route("/random-wfh").post(requestsController.generateRandomWFH);
router.route("/admin").post(requestsController.createAdminRequest);
router.route("/all").delete(requestsController.deleteAllRequests);
router
  .route("/:id")
  .patch(requestsController.updateRequestStatus)
  .delete(requestsController.deleteRequest);

module.exports = router;
