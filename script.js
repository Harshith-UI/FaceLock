
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
        roomId = Math.random().toString(36).substring(2, 10);
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
        if (message) {
            const messageElement = document.createElement("div");
            messageElement.textContent = `${username}: ${message}`;
            chatBox.appendChild(messageElement);
            chatInput.value = "";
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });

    function enterChatRoom(id) {
        roomIdDisplay.textContent = id;
        roomSelection.classList.add("hidden");
        chatRoom.classList.remove("hidden");
        updateParticipants(username);
    }

    function updateParticipants(user) {
        const participantElement = document.createElement("li");
        participantElement.textContent = user;
        participantList.appendChild(participantElement);
    }
});
