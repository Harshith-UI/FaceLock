const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const captureButton = document.getElementById("capture-button");
const resultDiv = document.getElementById("result");
const animationDiv = document.getElementById("animation");

// Start the camera feed
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    console.log("Camera initialized successfully.");
  })
  .catch((err) => {
    console.error("Camera access denied:", err);
    resultDiv.textContent = "Camera access is required for verification.";
  });

// Capture image and upload
captureButton.addEventListener("click", async () => {
  resultDiv.innerText = "Capturing and verifying...";
  animationDiv.innerHTML = ""; // Clear animations

  try {
    // Ensure canvas matches video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Capture the image from the video feed
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the image to base64
    const imageData = canvas.toDataURL("image/jpeg").split(",")[1];
    console.log("Base64 image captured:", imageData.slice(0, 100)); // Log first 100 characters for debugging

    // Call the API to upload and verify the image
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

    if (!response.ok) {
      throw new Error("API call failed with status: " + response.status);
    }

    const data = await response.json();
    console.log("API Response:", data);
    handleResult(data.access);
  } catch (error) {
    console.error("Error during image capture or upload:", error);
    resultDiv.textContent = "Error during verification.";
  }
});

// Handle API response
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
  animationDiv.innerHTML = ""; // Clear any previous animation
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
