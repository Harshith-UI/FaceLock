const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const captureButton = document.getElementById("capture-button");
const resultDiv = document.getElementById("result");
const animationDiv = document.getElementById("animation");

// Initialize camera
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Camera access denied:", err);
    resultDiv.textContent = "Camera access is required for verification.";
  });

// Capture snapshot and verify access
captureButton.addEventListener("click", async () => {
  resultDiv.innerText = "Verifying...";
  animationDiv.innerHTML = ""; // Clear animations

  try {
    // Ensure canvas dimensions match video feed
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to base64
    const imageData = canvas.toDataURL("image/jpeg").split(",")[1];

    console.log("Captured Image (Base64):", imageData); // Debug log

    // Call the backend API to upload and verify
    const response = await fetch(
      "https://mja1tyi5z7.execute-api.us-east-1.amazonaws.com/prod/recognize-face",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: "smart-attendance-upload",
          folder: "uploads",
          filename: "captured_image.jpeg",
          image_b64: imageData, // Include base64 image
        }),
      }
    );

    if (!response.ok) {
      throw new Error("API call failed with status: " + response.status);
    }

    const data = await response.json();
    handleResult(data.access);
  } catch (error) {
    console.error("Error during verification:", error);
    resultDiv.textContent = "Error during verification.";
  }
});

// Handle the API result
function handleResult(access) {
  if (access === "granted") {
    resultDiv.innerText = "Access Granted!";
    resultDiv.style.color = "green";
    playAnimation("granted");
  } else {
    resultDiv.innerText = "Access Denied!";
    resultDiv.style.color = "red";
    playAnimation("denied");
  }
}

// Play animations
function playAnimation(status) {
  animationDiv.innerHTML = ""; // Clear previous animation
  if (status === "granted") {
    animationDiv.innerHTML = `
      <div class="gate-open">🚪 Gate Opening... Welcome!</div>
    `;
  } else if (status === "denied") {
    animationDiv.innerHTML = `
      <div class="police-warning">🚔 Police Warning! Access Denied!</div>
    `;
  }
}
