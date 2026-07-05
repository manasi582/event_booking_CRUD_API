const pool = require("../config/db");

// ----------------------
// CREATE BOOKING (Atomic)
// ----------------------
async function createBooking(eventId, userId) {

    const MAX_RETRIES = 20;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        // Read current event
        const eventResult = await pool.query(
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
        const updateResult = await pool.query(
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

        // Someone else updated first
        if (updateResult.rows.length === 0) {

            console.log(`Retry ${attempt}`);

            // Wait 5 ms before trying again
            await new Promise(resolve => setTimeout(resolve, 5));

            continue;
}

        // Success -> create booking
        const bookingResult = await pool.query(
            `
            INSERT INTO bookings (event_id, user_id, status)
            VALUES ($1,$2,'CONFIRMED')
            RETURNING *;
            `,
            [eventId, userId]
        );

        return bookingResult.rows[0];
    }

    throw new Error("Could not complete booking after retries.");
}

// ----------------------
// CANCEL BOOKING
// ----------------------
async function cancelBooking(bookingId) {

    const bookingResult = await pool.query(
        `
        SELECT *
        FROM bookings
        WHERE id = $1
        `,
        [bookingId]
    );

    if (bookingResult.rows.length === 0) {
        throw new Error("Booking not found");
    }

    const booking = bookingResult.rows[0];

    if (booking.status === "CANCELLED") {
        throw new Error("Booking already cancelled");
    }

    const updatedBooking = await pool.query(
        `
        UPDATE bookings
        SET status = 'CANCELLED'
        WHERE id = $1
        RETURNING *;
        `,
        [bookingId]
    );

    await pool.query(
        `
        UPDATE events
        SET booked_seats = booked_seats - 1
        WHERE id = $1
        `,
        [booking.event_id]
    );

    return updatedBooking.rows[0];
}

// ----------------------
// GET BOOKINGS
// ----------------------
async function getBookingsByEvent(eventId) {

    const result = await pool.query(
        `
        SELECT *
        FROM bookings
        WHERE event_id = $1
        ORDER BY created_at DESC
        `,
        [eventId]
    );

    return result.rows;
}

module.exports = {
    createBooking,
    cancelBooking,
    getBookingsByEvent,
};