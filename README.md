# Event Booking System

This project is a back-end system for an event booking application, built with Node.js, Express, and PostgreSQL. It focuses on solving the critical problem of **concurrency and race conditions** when multiple users attempt to book the last available seats simultaneously.

## Tech Stack
* **Language:** JavaScript (Node.js)
* **Framework:** Express.js
* **Database:** PostgreSQL

## Project Structure
* `src/config`: Database connection configuration.
* `src/controllers`: Request handlers for events and bookings.
* `src/services`: Business logic and database interactions.
* `src/routes`: API endpoints definition.

## Concurrency Handling Approaches

When building a booking system, handling high concurrency safely is crucial. Below are flowcharts explaining three different approaches to handling seat bookings, highlighting their benefits and pitfalls.

### 1. Naive Implementation
The naive approach reads the available seats, checks if there is space, and then updates the record. This is highly susceptible to race conditions (overbooking) under high traffic, as multiple transactions might read the same initial value before any of them update it.

```mermaid
flowchart TD
    Start((Client Request)) --> ReadEvent[Read Event: Get Total & Booked Seats]
    ReadEvent --> CheckSpace{Are there<br>available seats?}
    
    CheckSpace -- Yes --> CreateBooking[Insert Booking Record]
    CreateBooking --> UpdateSeats[Update Event: Booked Seats + 1]
    UpdateSeats --> Success((Return Success))
    
    CheckSpace -- No --> Error((Return Error:<br>Sold Out))
```

### 2. Atomic Conditional Update
Instead of reading and then updating, this approach uses an atomic database update operation with a `WHERE` clause to check the condition. If the update fails (no rows affected), it means there were no seats available.

```mermaid
flowchart TD
    Start((Client Request)) --> UpdateEvent[UPDATE events<br>SET booked_seats = booked_seats + 1<br>WHERE id = ID AND booked_seats < total_seats]
    
    UpdateEvent --> CheckUpdate{Rows Affected > 0?}
    
    CheckUpdate -- Yes --> CreateBooking[Insert Booking Record]
    CreateBooking --> Success((Return Success))
    
    CheckUpdate -- No --> Error((Return Error:<br>Sold Out))
```

### 3. Optimistic Locking (Current Implementation)
This approach adds a `version` colum to the event record. It reads the current state and version, and later attempts to update *only if* the version hasn't changed. If the version has changed (someone else booked a seat in the meantime), it retries the operation. This is efficient for read-heavy systems and guarantees data integrity.

```mermaid
flowchart TD
    Start((Client Request)) --> ReadEvent[Read Event: Get Seats & Version]
    ReadEvent --> CheckSpace{Are there<br>available seats?}
    
    CheckSpace -- Yes --> UpdateEvent[UPDATE events<br>SET booked_seats = booked_seats + 1, version = version + 1<br>WHERE id = ID AND version = old_version]
    
    UpdateEvent --> CheckUpdate{Rows Affected > 0?}
    
    CheckUpdate -- Yes --> CreateBooking[Insert Booking Record]
    CreateBooking --> Success((Return Success))
    
    CheckUpdate -- No --> Wait[Wait a few ms]
    Wait --> ReadEvent
    
    CheckSpace -- No --> Error((Return Error:<br>Sold Out))
```

## Application Screenshots

Here are some screenshots demonstrating the system's behavior:

![Database Event](database_event.png)
![Event 1 Success](event1_success.png)
![Error Event 100](error_event100.png)
![Overbooked 50](overbooked_50.png)
![Total Seats, Booked Seats, Overbooked](totalseats_bookedseats_overbooked.png)

## Setup & Running

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root based on your database setup:
   ```env
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=event_booking
   PORT=3000
   ```

3. **Start the Server:**
   ```bash
   node src/server.js
   ```
