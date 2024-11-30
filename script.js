const AWS = window.AWS;
const mqtt = AWS.MQTT;

const iotEndpoint = "a2lm7t4wdaeepe-ats.iot.us-east-1.amazonaws.com"; // Replace with your AWS IoT endpoint
const clientId = "chatApp_" + Math.random().toString(36).substring(2); // Random client ID

const topicBase = "chat/"; // Base topic for chat rooms
let currentRoom = null;

// Initialize MQTT client
const mqttClient = mqtt.Client({
  region: "us-east-1", // Replace with your region
  clientId,
  endpoint: iotEndpoint,
});

// Connect to AWS IoT Core
mqttClient.on("connect", () => {
  console.log("Connected to AWS IoT Core");
});

// Event listener for sending messages
document.getElementById("send-btn").addEventListener("click", () => {
  const message = document.getElementById("message-input").value;
  if (currentRoom && message.trim()) {
    mqttClient.publish(`${topicBase}${currentRoom}`, JSON.stringify({ message }));
    document.getElementById("message-input").value = ""; // Clear input
  }
});

// Event listener for incoming messages
mqttClient.on("message", (topic, payload) => {
  const messageData = JSON.parse(payload.toString());
  const chatBox = document.getElementById("chat-box");
  const messageElement = document.createElement("div");
  messageElement.textContent = messageData.message;
  chatBox.appendChild(messageElement);
});

// Function to join a chat room
function joinRoom(roomId) {
  if (currentRoom) mqttClient.unsubscribe(`${topicBase}${currentRoom}`);
  currentRoom = roomId;
  mqttClient.subscribe(`${topicBase}${roomId}`);
}
