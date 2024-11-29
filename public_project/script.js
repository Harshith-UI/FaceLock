
// AWS Cognito Configurations
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const result = await Auth.signIn(email, password);
        alert('Login successful!');
        window.location.href = 'index.html';
    } catch (err) {
        alert('Error logging in: ' + err.message);
    }
}

async function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await Auth.signUp({ username: email, password });
        alert('Sign-up successful! Please log in.');
        window.location.href = 'login.html';
    } catch (err) {
        alert('Error signing up: ' + err.message);
    }
}

async function logout() {
    try {
        await Auth.signOut();
        alert('Logged out successfully!');
        window.location.href = 'login.html';
    } catch (err) {
        alert('Error logging out: ' + err.message);
    }
}

function sendMessage() {
    const message = document.getElementById('message-input').value;
    if (message.trim()) {
        const messagesDiv = document.getElementById('messages');
        const newMessage = document.createElement('div');
        newMessage.textContent = message;
        newMessage.className = 'message';
        messagesDiv.appendChild(newMessage);
        document.getElementById('message-input').value = '';
    }
}
