const eventService = require("../services/eventService");

async function createEvent(req, res) {
    try {
        const { name, total_seats } = req.body;

        const event = await eventService.createEvent(name, total_seats);

        res.status(201).json(event);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to create event"
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
            message: "Failed to fetch events"
        });
    }
}
async function getEventById(req, res) {
    try {

        const id = req.params.id;

        const event = await eventService.getEventById(id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json(event);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to fetch event"
        });

    }
}

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
};