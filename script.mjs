import Amplify, { API } from './node_modules/aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

// Variables
let username = null;
let currentRoom = null;
const participants = [];

async function initMQTTClient() {
  try {
    const { IOT_ENDPOINT } = await API.getEnvironmentVariables();
    const clientId = "chatApp_" + Math.random().toString(36).substring(2);
    const mqttClient = new Paho.MQTT.Client(IOT_ENDPOINT, 443, clientId);

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
    document.getElementById("enter-btn").addEventListener("click", () => {
      username = document.getElementById("username-input").value.trim();
      console.log("Username entered:", username);
      if (username) {
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("room-section").style.display = "block";
      } else {
        alert("Please enter a valid username.");
      }
    });

    document.getElementById("create-room-btn").addEventListener("click", () => {
      currentRoom = `room_${Math.random().toString(36).substring(7)}`;
      console.log("Room created with ID:", currentRoom);
      enterRoom(mqttClient, currentRoom, username);
    });

    document.getElementById("join-room-btn").addEventListener("click", () => {
      currentRoom = document.getElementById("room-id-input").value;
      console.log("Joining room with ID:", currentRoom);
      if (currentRoom) {
        enterRoom(mqttClient, currentRoom, username);
      }
    });

    document.getElementById("send-btn").addEventListener("click", () => {
      const message = document.getElementById("message-input").value;
      console.log("Sending message:", message);
      if (message) {
        const msgPayload = JSON.stringify({ username, message });
        mqttClient.send(`${currentRoom}/messages`, msgPayload);
        document.getElementById("message-input").value = "";
      }
    });
  } catch (error) {
    console.error("Error initializing MQTT client:", error);
    const errorMessage = "Failed to connect to the chat server. Please try again later.";
    alert(errorMessage);
  }
}

function enterRoom(mqttClient, currentRoom, username) {
  console.log("Entering room:", currentRoom);
  mqttClient.subscribe(`${currentRoom}/messages`);
  mqttClient.subscribe(`${currentRoom}/participants`);
  mqttClient.send(`${currentRoom}/participants`, JSON.stringify({ username }));
  document.getElementById("room-section").style.display = "none";
  document.getElementById("chat-section").style.display = "block";
  document.getElementById("room-info").textContent = `Room ID: ${currentRoom}`;
}

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

initMQTTClient();
