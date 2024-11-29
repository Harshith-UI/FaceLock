document.addEventListener("DOMContentLoaded", () => {
    const usernamePrompt = document.getElementById("usernamePrompt");
    const usernameInput = document.getElementById("usernameInput");
    const usernameSubmit = document.getElementById("usernameSubmit");
    const roomSelection = document.getElementById("roomSelection");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const createRoom = document.getElementById("createRoom");
    const joinRoom = document.getElementById("joinRoom");
    const chatRoom = document.getElementById("chatRoom");
    const roomIdDisplay = document.getElementById("roomIdDisplay");
    const chatBox = document.getElementById("chatBox");
    const chatInput = document.getElementById("chatInput");
    const sendMessage = document.getElementById("sendMessage");
    const participantList = document.getElementById("participantList");

    let username = "";
    let roomId = "";
    let socket;

    usernameSubmit.addEventListener("click", () => {
        username = usernameInput.value.trim();
        if (username) {
            usernamePrompt.classList.add("hidden");
            roomSelection.classList.remove("hidden");
            welcomeMessage.textContent = `Hello, ${username}!`;
        } else {
            alert("Please enter a username.");
        }
    });

    createRoom.addEventListener("click", () => {
        roomId = Math.random().toString(36).substring(2, 10); // Generate unique room ID
        enterChatRoom(roomId);
    });

    joinRoom.addEventListener("click", () => {
        const enteredRoomId = prompt("Enter Room ID:");
        if (enteredRoomId) {
            roomId = enteredRoomId;
            enterChatRoom(roomId);
        }
    });

    sendMessage.addEventListener("click", () => {
        const message = chatInput.value.trim();
        if (message && socket) {
            // Send message to WebSocket server
            socket.send(
                JSON.stringify({
                    type: "message",
                    room: roomId,
                    username: username,
                    text: message,
                })
            );

            chatInput.value = "";
        }
    });

    function enterChatRoom(id) {
        roomIdDisplay.textContent = id;
        roomSelection.classList.add("hidden");
        chatRoom.classList.remove("hidden");

        // Initialize WebSocket connection
        initializeWebSocket();

        // Notify server about new participant
        socket.send(
            JSON.stringify({
                type: "join",
                room: roomId,
                username: username,
            })
        );
    }

    function initializeWebSocket() {
        // Replace with your WebSocket server URL
        socket = new WebSocket("wss://your-websocket-server-url");

        socket.onopen = () => {
            console.log("WebSocket connection established.");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "message" && data.room === roomId) {
                // Display received message in chat box
                const messageElement = document.createElement("div");
                messageElement.textContent = `${data.username}: ${data.text}`;
                chatBox.appendChild(messageElement);
                chatBox.scrollTop = chatBox.scrollHeight;
            }

            if (data.type === "join" && data.room === roomId) {
                // Add new participant to the participant list
                updateParticipants(data.username);
            }
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }

    function updateParticipants(user) {
        const participantElement = document.createElement("li");
        participantElement.textContent = user;
        participantList.appendChild(participantElement);
    }
});

