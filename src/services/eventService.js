const pool = require("../config/db");

async function createEvent(name, total_seats) {
    const query = `
        INSERT INTO events (name, total_seats)
        VALUES ($1, $2)
        RETURNING *;
    `;

    const values = [name, total_seats];

    const result = await pool.query(query, values);

    return result.rows[0];
}
async function getAllEvents() {

    const query = `
        SELECT
            id,
            name,
            total_seats,
            booked_seats,
            total_seats - booked_seats AS remaining_seats,
            created_at
        FROM events
        ORDER BY id;
    `;

    const result = await pool.query(query);

    return result.rows;
}

async function getEventById(id) {

    const query = `
        SELECT
            id,
            name,
            total_seats,
            booked_seats,
            total_seats - booked_seats AS remaining_seats,
            created_at
        FROM events
        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
}

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
};