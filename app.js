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
  
  // Generate a unique filename (timestamp + random string)
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 8);
  const filename = `captured_image_${timestamp}_${random}.jpeg`;
  
  // Call the backend API
  try {
    console.log("Sending request to backend...");
    const requestBody = {
      bucket: "smart-attendance-upload",
      folder: "uploads",
      filename: filename,
      image: imageData,
    };
    console.log("Request parameters:", { 
      bucket: requestBody.bucket,
      folder: requestBody.folder,
      filename: requestBody.filename,
      imageSize: requestBody.image ? requestBody.image.length : 0
    });
    
    const response = await fetch(
      "https://mja1tyi5z7.execute-api.us-east-1.amazonaws.com/prod/recognize-face",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );
    
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries([...response.headers]));
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log("Raw response:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed response data:", data);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      resultDiv.textContent = "Error: Invalid response format";
      resultDiv.style.color = "red";
      return;
    }
    
    handleResult(data);
  } catch (error) {
    console.error("Error during verification:", error);
    resultDiv.textContent = "Error during verification: " + error.message;
    resultDiv.style.color = "red";
  }
});

// Handle the result
function handleResult(data) {
  try {
    console.log("Handling result:", data);
    
    // Check if data exists and has the expected structure
    if (!data) {
      throw new Error('Empty response received');
    }
    
    let result;
    
    // Log the type of data and its properties
    console.log("Response type:", typeof data);
    console.log("Response has body property:", data.hasOwnProperty('body'));
    
    // Handle different response structures
    if (typeof data === 'object' && data.hasOwnProperty('body')) {
      console.log("Body type:", typeof data.body);
      
      // If data.body is a string (Lambda proxy integration format)
      if (typeof data.body === 'string') {
        try {
          result = JSON.parse(data.body);
          console.log("Parsed body:", result);
        } catch (parseError) {
          console.error("Error parsing response body:", parseError);
          throw new Error('Invalid JSON in response body');
        }
      } else {
        // If body is already an object
        result = data.body;
        console.log("Body is already an object:", result);
      }
    } else {
      // If the response is already the result object
      result = data;
      console.log("Using data as result:", result);
    }
    
    // Log the access property
    console.log("Result has access property:", result.hasOwnProperty('access'));
    console.log("Access value:", result.access);
    
    // Now process the result
    if (result.access === "granted") {
      resultDiv.textContent = "Access Granted!";
      resultDiv.style.color = "green";
      playAnimation("granted"); // Show gate opening animation
    } else if (result.access === "denied") {
      resultDiv.textContent = "Access Denied!";
      resultDiv.style.color = "red";
      playAnimation("denied"); // Show police warning animation
    } else if (result.error) {
      resultDiv.textContent = "Error: " + result.error;
      resultDiv.style.color = "red";
    } else {
      // Display the exact response for debugging
      resultDiv.textContent = "Unknown response from server";
      resultDiv.style.color = "orange";
      console.log("Full unknown response:", JSON.stringify(result, null, 2));
      
      // Check specific properties that might be present
      if (result.statusCode) {
        console.log("Status code:", result.statusCode);
      }
      if (result.message) {
        console.log("Message:", result.message);
      }
    }
  } catch (error) {
    console.error("Error parsing backend response:", error);
    resultDiv.textContent = "Error during verification: " + error.message;
    resultDiv.style.color = "red";
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
