console.log("Booking controller loaded");
const bookingService = require("../services/bookingService");

async function createBooking(req, res) {

    try {

        const eventId = req.params.id;

        const { user_id } = req.body;

        const booking =
            await bookingService.createBooking(eventId, user_id);

        res.status(201).json(booking);

    }
    catch (err) {

    console.error(err);

    if (err.message === "Event not found") {
        return res.status(404).json({
            message: err.message
        });
    }

    if (
        err.message === "Sold Out" ||
        err.message === "Could not complete booking after retries."
    ) {
        return res.status(409).json({
            message: err.message
        });
    }

    res.status(500).json({
        message: "Internal Server Error"
    });
}

}
async function cancelBooking(req,res){

    try{

        const bookingId = req.params.id;

        const booking =
            await bookingService.cancelBooking(bookingId);

        res.json(booking);

    }

    catch (err) {

    console.error(err);

    if (err.message === "Booking not found") {
        return res.status(404).json({
            message: err.message
        });
    }

    if (err.message === "Booking already cancelled") {
        return res.status(409).json({
            message: err.message
        });
    }

    res.status(500).json({
        message: "Internal Server Error"
    });
}

}
async function getBookingsByEvent(req,res){

    try{

        const eventId = req.params.id;

        const bookings =
            await bookingService.getBookingsByEvent(eventId);

        res.json(bookings);

    }

    catch(err){

        console.error(err);

        res.status(500).json({
            message:"Cannot fetch bookings"
        });

    }

}

module.exports = {

    createBooking,

    cancelBooking,

    getBookingsByEvent,

};