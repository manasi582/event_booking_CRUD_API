const axios = require("axios");

const EVENT_ID = 3;   // Change this to your event ID

async function sendBookingRequest(userNumber) {
    try {
        const response = await axios.post(
            `http://localhost:3000/events/${EVENT_ID}/bookings`,
            {
                user_id: `user_${userNumber}`
            }
        );

        return {
            success: true,
            data: response.data
        };

    } catch (err) {

        return {
            success: false,
            message: err.response?.data || err.message
        };

    }
}

async function runLoadTest() {

    const requests = [];

    for (let i = 1; i <= 50; i++) {
        requests.push(sendBookingRequest(i));
    }

    const results = await Promise.all(requests);

    const success = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log("----------------------------");
    console.log("Load Test Finished");
    console.log("----------------------------");
    console.log("Successful Bookings :", success.length);
    console.log("Failed Bookings     :", failed.length);

    console.log("\nFirst Failed Request:");
    console.log(failed[0]);

}

runLoadTest();