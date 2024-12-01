const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const captureButton = document.getElementById("capture-button");
const resultDiv = document.getElementById("result");
const animationDiv = document.getElementById("animation");

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

// Capture the image and verify
captureButton.addEventListener("click", async () => {
  resultDiv.textContent = "Verifying...";
  animationDiv.innerHTML = ""; // Clear animations

  // Draw the video frame on the canvas
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert the canvas image to base64
  const imageData = canvas.toDataURL("image/jpeg").split(",")[1];

  // Call the backend API
  try {
    const response = await fetch(
      "https://mja1tyi5z7.execute-api.us-east-1.amazonaws.com/prod/recognize-face",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: "smart-attendance-upload",
          folder: "uploads",
          filename: "captured_image.jpeg",
          image: imageData,
        }),
      }
    );

    const data = await response.json();
    handleResult(data);
  } catch (error) {
    console.error("Error during verification:", error);
    resultDiv.textContent = "Error during verification.";
  }
});

// Handle the result
function handleResult(data) {
  if (data.access === "granted") {
    resultDiv.textContent = "Access Granted!";
    resultDiv.style.color = "green";
    playAnimation("granted"); // Show gate opening animation
  } else {
    resultDiv.textContent = "Access Denied!";
    resultDiv.style.color = "red";
    playAnimation("denied"); // Show police warning animation
  }
}

// Play animations based on result
function playAnimation(type) {
  if (type === "granted") {
    animationDiv.textContent = "🚪 Gate Opening... Welcome!";
  } else if (type === "denied") {
    animationDiv.textContent = "🚔 Police Warning! Access Denied!";
  }
}
