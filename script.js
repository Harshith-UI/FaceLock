// Variables
let username = null;
let currentRoom = null;
const participants = [];

// MQTT Client Setup
let iotEndpoint;

// Fetch the IOT_ENDPOINT from Amplify environment variables
async function getIoTEndpoint() {
  try {
    const { IOT_ENDPOINT } = await API.getEnvironmentVariables();
    iotEndpoint = IOT_ENDPOINT;
  } catch (error) {
    console.error("Error fetching IoT endpoint:", error);
    const errorMessage = "Failed to retrieve IoT endpoint. Please try again later.";
    alert(errorMessage);
  }
}

getIoTEndpoint().then(() => {
  // MQTT Client Initialization
  const clientId = "chatApp_" + Math.random().toString(36).substring(2);
  const mqttClient = new Paho.MQTT.Client(iotEndpoint, 443, clientId);

  // Connect to AWS IoT
  mqttClient.connect({
    useSSL: true,
    timeout: 3,
    onSuccess: () => {
      console.log("Connected to IoT Core");
    },
    onFailure: (error) => {
      console.error("Connection to IoT Core failed:", error);
      console.error("Error code:", error.errorCode);
      console.error("Error message:", error.errorMessage);
      console.error("Invocation context:", error.invocationContext);

      // Display a user-friendly error message
      const errorMessage = "Failed to connect to the chat server. Please try again later.";
      alert(errorMessage);
    },
  });

  // MQTT Handlers
  mqttClient.onMessageArrived = (message) => {
    console.log("Message arrived:", message);
    const topic = message.destinationName;
    const payload = JSON.parse(message.payloadString);

    if (topic.endsWith("/messages")) {
      const chatBox = document.getElementById("chat-box");
      const msgElement = document.createElement("div");
      msgElement.textContent = `${payload.username}: ${payload.message}`;
      chatBox.appendChild(msgElement);
    } else if (topic.endsWith("/participants")) {
      participants.push(payload.username);
      updateParticipants();
    }
  };

  // Event Listeners
  // (Rest of the event listener code remains the same)
});

// Helper Functions
function updateParticipants() {
  const participantsDiv = document.getElementById("participants");
  participantsDiv.innerHTML = "";
  participants.forEach((user) => {
    const userElement = document.createElement("div");
    userElement.textContent = user;
    participantsDiv.appendChild(userElement);
  });
  console.log("Updated participants list:", participants);
}
