const pool = require("../config/db");

// ----------------------
// CREATE BOOKING (Optimistic + Transaction)
// ----------------------
async function createBooking(eventId, userId) {

    const client = await pool.connect();
    const MAX_RETRIES = 20;

    try {

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

            await client.query("BEGIN");

            try {

                // Read current event
                const eventResult = await client.query(
                    `
                    SELECT *
                    FROM events
                    WHERE id = $1
                    `,
                    [eventId]
                );

                if (eventResult.rows.length === 0) {
                    throw new Error("Event not found");
                }

                const event = eventResult.rows[0];

                if (event.booked_seats >= event.total_seats) {
                    throw new Error("Sold Out");
                }

                // Try updating using version
                const updateResult = await client.query(
                    `
                    UPDATE events
                    SET booked_seats = booked_seats + 1,
                        version = version + 1
                    WHERE id = $1
                    AND version = $2
                    RETURNING *;
                    `,
                    [eventId, event.version]
                );

                // Version conflict
                if (updateResult.rows.length === 0) {

                    await client.query("ROLLBACK");

                    console.log(`Retry ${attempt}`);

                    await new Promise(resolve => setTimeout(resolve, 5));

                    continue;
                }

                // Insert booking
                const bookingResult = await client.query(
                    `
                    INSERT INTO bookings (event_id, user_id, status)
                    VALUES ($1, $2, 'CONFIRMED')
                    RETURNING *;
                    `,
                    [eventId, userId]
                );

                await client.query("COMMIT");

                return bookingResult.rows[0];

            } catch (err) {

                await client.query("ROLLBACK");
                throw err;

            }

        }

        throw new Error("Could not complete booking after retries.");

    } finally {

        client.release();

    }
}

module.exports = {
    createBooking,
    cancelBooking,
    getBookingsByEvent,
};