const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const verifyButton = document.getElementById("capture-button"); // Corrected ID
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
verifyButton.addEventListener("click", async () => {
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
          image: imageData, // Use "image" as expected by the Lambda
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
  try {
    // Parse the backend response's "body" field
    const result = JSON.parse(data.body); // Parse the "body" string
    if (result.access === "granted") {
      resultDiv.textContent = "Access Granted!";
      resultDiv.style.color = "green";
      playAnimation("granted"); // Show gate opening animation
    } else {
      resultDiv.textContent = "Access Denied!";
      resultDiv.style.color = "red";
      playAnimation("denied"); // Show police warning animation
    }
  } catch (error) {
    console.error("Error parsing backend response:", error);
    resultDiv.textContent = "Error during verification.";
  }
}

// Play animations based on result
function playAnimation(type) {
  if (type === "granted") {
    animationDiv.innerHTML = "🚪 Gate Opening... Welcome!";
  } else if (type === "denied") {
    animationDiv.innerHTML = "🔒 Unauthorized Attempt Detected! Please try again or contact security!";
  }
}
