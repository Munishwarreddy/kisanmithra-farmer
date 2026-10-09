const axios = require("axios");

async function debug() {
  try {
    // 1. Register Consumer
    const consumerRes = await axios.post("http://localhost:5000/api/auth/register", {
      name: "Test Consumer",
      email: `consumer_${Date.now()}@test.com`,
      password: "password123",
      role: "consumer"
    });
    const consumerToken = consumerRes.data.token;
    
    // 2. Register Farmer
    const farmerRes = await axios.post("http://localhost:5000/api/auth/register", {
      name: "Test Farmer",
      email: `farmer_${Date.now()}@test.com`,
      password: "password123",
      role: "farmer",
      phone: "1234567890"
    });
    const farmerId = farmerRes.data.user._id;

    // 3. Send Message from Consumer to Farmer
    console.log("Sending message...");
    const msgRes = await axios.post(
      "http://localhost:5000/api/messages",
      { recipient: farmerId, content: "Hello testing 123" },
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
