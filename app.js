const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const resultDiv = document.getElementById("result");
const animationDiv = document.getElementById("animation");

// Set canvas dimensions to match the video feed
canvas.width = 640; // Set a fixed width
canvas.height = 480; // Set a fixed height

// Start the camera
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Camera access denied:", err);
    resultDiv.textContent = "Camera access is required for verification.";
  });

// Periodically capture frames and verify
setInterval(async () => {
  try {
    // Draw video frame to canvas
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to base64
    const imageData = canvas.toDataURL("image/jpeg").split(",")[1];

    // Call your API
    const response = await fetch(
      "https://mja1tyi5z7.execute-api.us-east-1.amazonaws.com/prod/recognize-face",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: "smart-attendance-upload",
          folder: "uploads",
          filename: "captured_image.jpeg",
          image_b64: imageData,
        }),
      }
    );

    // Parse response and handle result
    const data = await response.json();
    handleResult(data); // Directly pass the parsed response
  } catch (error) {
    console.error("Error verifying face:", error);
    resultDiv.textContent = "Error during verification.";
  }
}, 2000); // Capture every 2 seconds

// Handle API result
function handleResult(data) {
  try {
    if (data.access === "granted") {
      resultDiv.innerText = "Access Granted!";
      resultDiv.style.color = "green";
      playAnimation("granted"); // Show the gate opening animation
    } else {
      resultDiv.innerText = "Access Denied!";
      resultDiv.style.color = "red";
      playAnimation("denied"); // Show the police officer warning animation
    }
  } catch (error) {
    console.error("Error handling result:", error);
    resultDiv.textContent = "Error during verification.";
  }
}

// Play animations
function playAnimation(status) {
  animationDiv.innerHTML = ""; // Clear previous animation
  if (status === "granted") {
    animationDiv.innerHTML = `<div class="gate-open">🚪 Gate Opening...</div>`;
  } else if (status === "denied") {
    animationDiv.innerHTML = `<div class="police-warning">🚔 Police Warning...</div>`;
  }
}
