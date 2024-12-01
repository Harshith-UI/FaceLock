const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
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

// Periodically capture frames and verify
setInterval(async () => {
  // Draw video frame to canvas
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert canvas image to base64
  const imageData = canvas.toDataURL("image/jpeg").split(",")[1];

  // Call your API
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
          image_b64: imageData,
        }),
      }
    );

    const data = await response.json();
    handleResult(data.access);
  } catch (error) {
    console.error("Error verifying face:", error);
    resultDiv.textContent = "Error during verification.";
  }
}, 2000); // Capture every 2 seconds

// Handle API result
function handleResult(access) {
  resultDiv.textContent = `Access: ${access.toUpperCase()}`;
  animationDiv.innerHTML = ""; // Clear previous animations

  if (access === "granted") {
    const gate = document.createElement("div");
    gate.className = "gate-open";
    animationDiv.appendChild(gate);
  } else {
    const warning = document.createElement("div");
    warning.className = "warning-flash";
    animationDiv.appendChild(warning);
  }
}
