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
            console.log(`Username entered: ${username}`);
            usernamePrompt.classList.add("hidden");
            roomSelection.classList.remove("hidden");
            welcomeMessage.textContent = `Hello, ${username}!`;
        } else {
            alert("Please enter a username.");
        }
    });

    createRoom.addEventListener("click", () => {
        roomId = Math.random().toString(36).substring(2, 10); // Generate unique room ID
        console.log(`Room created with ID: ${roomId}`);
        enterChatRoom(roomId);
    });

    joinRoom.addEventListener("click", () => {
        const enteredRoomId = prompt("Enter Room ID:");
        if (enteredRoomId) {
            roomId = enteredRoomId.trim();
            console.log(`Joining room with ID: ${roomId}`);
            enterChatRoom(roomId);
        }
    });

    sendMessage.addEventListener("click", () => {
        const message = chatInput.value.trim();
        if (message && socket) {
            console.log(`Sending message: ${message}`);
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
        roomIdDisplay.textContent = `Room ID: ${id}`;
        roomSelection.classList.add("hidden");
        chatRoom.classList.remove("hidden");

        initializeWebSocket();

        // Notify server about joining
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    type: "join",
                    room: id,
                    username: username,
                })
            );
            console.log(`Sent join request to room ${id} as ${username}`);
        } else {
            console.error("WebSocket is not open. Cannot send join message.");
        }
    }

    function initializeWebSocket() {
        // Replace with your WebSocket server URL
        const wsUrl = "wss://fg94j4ye24k.execute-api.us-east-1.amazonaws.com/production/";
        console.log(`Connecting to WebSocket server at ${wsUrl}`);
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("Connected to WebSocket server.");
        };

        socket.onmessage = (event) => {
            console.log(`Message received from server: ${event.data}`);
            const data = JSON.parse(event.data);

            if (data.type === "message" && data.room === roomId) {
                // Append the message to the chat box
                const messageElement = document.createElement("div");
                messageElement.textContent = `${data.username}: ${data.text}`;
                chatBox.appendChild(messageElement);
                chatBox.scrollTop = chatBox.scrollHeight;
                console.log(`Message displayed in chat box: ${data.username}: ${data.text}`);
            }

            if (data.type === "join" && data.room === roomId) {
                // Add the new participant to the participant list
                console.log(`New participant joined: ${data.username}`);
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
        console.log(`Added ${user} to participant list.`);
    }
});


