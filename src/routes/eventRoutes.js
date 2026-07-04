const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");

console.log("eventController =", eventController);
console.log("createEvent:", typeof eventController.createEvent);
console.log("getAllEvents:", typeof eventController.getAllEvents);

router.post("/", eventController.createEvent);
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);

module.exports = router;