const express = require("express");

const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Event Booking API Running 🚀");
});

app.use("/events", eventRoutes);
app.use("/", bookingRoutes);

module.exports = app;