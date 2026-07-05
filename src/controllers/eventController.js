const eventService = require("../services/eventService");

async function createEvent(req, res) {
    try {

        const { name, total_seats } = req.body;

        const event = await eventService.createEvent(name, total_seats);

        res.status(201).json(event);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

async function getAllEvents(req, res) {
    try {

        const events = await eventService.getAllEvents();

        res.status(200).json(events);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

async function getEventById(req, res) {
    try {

        const id = req.params.id;

        const event = await eventService.getEventById(id);

        res.status(200).json(event);

    } catch (err) {

        console.error(err);

        if (err.message === "Event not found") {
            return res.status(404).json({
                message: err.message
            });
        }

        res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
};