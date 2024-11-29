const apiUrl = "https://6wvb2obx25eqrinh3ycerjqdf4.appsync-api.us-east-1.amazonaws.com/graphql"; // Replace with your AppSync GraphQL API URL
const apiKey = "da2-6nna6dm2fzbo3eqsvvaup6q5nm"; // Replace with your AppSync API Key

let username = "";
let roomId = "";

// Step 1: Set username
function setUsername() {
  username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Please enter a valid username!");
    return;
  }
  document.getElementById("username-prompt").style.display = "none";
  document.getElementById("room-options").style.display = "block";
}

// Step 2: Create a new room
function createRoom() {
  roomId = generateRoomId();
  openRoom(roomId);
}

// Step 3: Show join room input
function showJoinRoom() {
  document.getElementById("room-options").style.display = "none";
  document.getElementById("join-room").style.display = "block";
}

// Step 4: Join an existing room
function joinRoom() {
  roomId = document.getElementById("roomid").value.trim();
  if (!roomId) {
    alert("Please enter a valid Room ID!");
    return;
  }
  openRoom(roomId);
}

// Step 5: Open the room (create or join)
function openRoom(roomId) {
  document.getElementById("room-options").style.display = "none";
  document.getElementById("join-room").style.display = "none";
  document.getElementById("chat-room").style.display = "block";
  document.getElementById("room-title").innerText = `Room ID: ${roomId}`;
  updateParticipants();
  fetchMessages();
  subscribeToMessages();
}

// Step 6: Generate a unique Room ID
function generateRoomId() {
  return Math.random().toString(36).substr(2, 8); // Simple random ID generator
}

// Step 7: Send a message
function sendMessage() {
  const message = document.getElementById("message-input").value.trim();
  if (!message) return;

  const mutation = `
    mutation SendMessage {
      sendMessage(roomId: "${roomId}", username: "${username}", content: "${message}") {
        id
        roomId
        username
        content
        timestamp
      }
    }
  `;

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({ query: mutation })
  }).then(() => {
    document.getElementById("message-input").value = "";
    fetchMessages();
  });
}

// Step 8: Fetch messages for the room
function fetchMessages() {
  const query = `
    query GetMessages {
      getMessages(roomId: "${roomId}") {
        id
        username
        content
        timestamp
      }
    }
  `;

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({ query: query })
  })
    .then(response => response.json())
    .then(data => {
      const messages = data.data.getMessages;
      const messagesDiv = document.getElementById("messages");
      messagesDiv.innerHTML = messages.map(msg => `<p><strong>${msg.username}:</strong> ${msg.content}</p>`).join("");
    });
}

// Step 9: Subscribe to new messages
function subscribeToMessages() {
  const subscription = `
    subscription OnMessageAdded {
      onMessageAdded(roomId: "${roomId}") {
        id
        username
        content
        timestamp
      }
    }
  `;

  const eventSource = new EventSource(`${apiUrl}?query=${encodeURIComponent(subscription)}`);
  eventSource.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const newMessage = data.data.onMessageAdded;

    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML += `<p><strong>${newMessage.username}:</strong> ${newMessage.content}</p>`;
  };
}

// Step 10: Update participants in the room
function updateParticipants() {
  const participantsDiv = document.getElementById("participants");
  participantsDiv.innerHTML = `<p><strong>Participants:</strong> ${username}</p>`;
}
