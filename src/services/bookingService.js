const pool = require("../config/db");

// ----------------------
// CREATE BOOKING (Atomic)
// ----------------------
async function createBooking(eventId, userId) {

    // Atomic update
    const updateResult = await pool.query(
        `
        UPDATE events
        SET booked_seats = booked_seats + 1
        WHERE id = $1
        AND booked_seats < total_seats
        RETURNING *;
        `,
        [eventId]
    );

    // No row updated = either event doesn't exist OR sold out
    if (updateResult.rows.length === 0) {

        // Check whether the event exists
        const eventResult = await pool.query(
            "SELECT id FROM events WHERE id = $1",
            [eventId]
        );

        if (eventResult.rows.length === 0) {
            throw new Error("Event not found");
        }

        throw new Error("Sold Out");
    }

    // Create booking
    const bookingResult = await pool.query(
        `
        INSERT INTO bookings (event_id, user_id, status)
        VALUES ($1, $2, 'CONFIRMED')
        RETURNING *;
        `,
        [eventId, userId]
    );

    return bookingResult.rows[0];
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