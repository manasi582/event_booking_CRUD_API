const pool = require("../config/db");

async function createBooking(eventId, userId) {

    const eventResult = await pool.query(
        "SELECT * FROM events WHERE id = $1",
        [eventId]
    );

    if (eventResult.rows.length === 0) {
        throw new Error("Event not found");
    }

    const event = eventResult.rows[0];

    if (event.booked_seats >= event.total_seats) {
        throw new Error("Sold Out");
    }

    await pool.query(
        `UPDATE events
         SET booked_seats = booked_seats + 1
         WHERE id = $1`,
        [eventId]
    );

    const bookingResult = await pool.query(
        `INSERT INTO bookings (event_id, user_id, status)
         VALUES ($1, $2, 'CONFIRMED')
         RETURNING *`,
        [eventId, userId]
    );

    return bookingResult.rows[0];
}

async function cancelBooking(bookingId) {

    // Step 1: Find the booking
    const bookingResult = await pool.query(
        `SELECT *
         FROM bookings
         WHERE id = $1`,
        [bookingId]
    );

    if (bookingResult.rows.length === 0) {
        throw new Error("Booking not found");
    }

    const booking = bookingResult.rows[0];

    // Step 2: Check if already cancelled
    if (booking.status === "CANCELLED") {
        throw new Error("Booking already cancelled");
    }

    // Step 3: Mark booking as cancelled
    const updatedBooking = await pool.query(
        `UPDATE bookings
         SET status = 'CANCELLED'
         WHERE id = $1
         RETURNING *`,
        [bookingId]
    );

    // Step 4: Reduce booked seats
    await pool.query(
        `UPDATE events
         SET booked_seats = booked_seats - 1
         WHERE id = $1`,
        [booking.event_id]
    );

    return updatedBooking.rows[0];
}

async function getBookingsByEvent(eventId) {

    const result = await pool.query(
        `SELECT *
         FROM bookings
         WHERE event_id = $1
         ORDER BY created_at DESC`,
        [eventId]
    );

    return result.rows;
}

module.exports = {
    createBooking,
    cancelBooking,
    getBookingsByEvent,
};