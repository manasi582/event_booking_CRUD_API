console.log("Booking routes loaded");
const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");

router.post("/events/:id/bookings", bookingController.createBooking);

router.delete("/bookings/:id", bookingController.cancelBooking);

router.get("/events/:id/bookings", bookingController.getBookingsByEvent);

module.exports = router;