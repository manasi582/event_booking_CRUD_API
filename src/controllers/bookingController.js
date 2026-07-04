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
    catch(err){

        console.error(err);

        res.status(500).json({
            message:"Booking failed"
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

    catch(err){

        console.error(err);

        res.status(500).json({
            message:"Cancel failed"
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