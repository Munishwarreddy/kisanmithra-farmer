const axios = require("axios");

async function debug() {
  try {
    // 1. Login as seeded Consumer
    console.log("Logging in as consumer1...");
    const consumerRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "consumer1@kisanmithra.com",
      password: "farmer123",
    });
    const consumerToken = consumerRes.data.token;
    
    // 2. Login as seeded Farmer to get their ID and ensure they exist
    console.log("Logging in as Farmer...");
    const farmerRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "venkata.ramana@kisanmithra.com",
      password: "farmer123",
    });
    const farmerId = farmerRes.data.user._id;

    // 3. Send Message from Consumer to Farmer
    console.log(`Sending message from Consumer to Farmer (${farmerId})...`);
    const msgRes = await axios.post(
      "http://localhost:5000/api/messages",
      { recipient: farmerId, content: "Hello existing farmer!" },
      { headers: { Authorization: `Bearer ${consumerToken}` } }
    );
    console.log("SUCCESS:", JSON.stringify(msgRes.data, null, 2));

  } catch (err) {
    if (err.response) {
      console.error("SERVER ERROR:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("NETWORK ERROR:", err.message);
    }
  }
}

debug();
