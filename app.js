const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const captureButton = document.getElementById("capture-button");
const resultDiv = document.getElementById("result");
const animationDiv = document.getElementById("animation");
const gateContainer = document.getElementById("gate-container");
const policeContainer = document.getElementById("police-container");

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
  // Hide both animations initially
  gateContainer.style.display = "none";
  policeContainer.style.display = "none";
  
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
    playAnimation("granted");
  } else {
    resultDiv.textContent = "Access Denied!";
    resultDiv.style.color = "red";
    playAnimation("denied");
  }
}

// Play animations based on result
function playAnimation(type) {
  if (type === "granted") {
    // Show gate animation
    gateContainer.style.display = "block";
    policeContainer.style.display = "none";
    setTimeout(() => {
      gateContainer.classList.add("open");
    }, 100);
  } else if (type === "denied") {
    // Show police animation
    gateContainer.style.display = "none";
    policeContainer.style.display = "block";
  }
}
