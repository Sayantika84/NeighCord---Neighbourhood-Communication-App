let socket, name, userLocation; 
function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
window.onload = function () {
    name = sessionStorage.getItem("name");
    userLocation = sessionStorage.getItem("location");
    userLocation = capitalizeFirstLetter(userLocation);
    if (!name || !userLocation) {
        alert("Invalid access. Redirecting to login.");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("chatroom-title").textContent = `Location: ${userLocation}`;
    
    // Explicit connection to server
    //socket = io("http://192.168.42.57:3000"); //put your ip address
    socket = io("http://localhost:3000") //for local 

    // Join chatroom
    socket.emit("join", { name, userlocation: userLocation });

    // Display messages
    socket.on("message", (msg) => {
        displayMessage(msg);
    });

    // Handle alerts
    socket.on("alert", (alertMsg) => {
        displayAlert(alertMsg);
    });
};

function sendMessage() {
    let text = document.getElementById("msg").value.trim();
    if (text) {
        socket.emit("message", { 
            userlocation: userLocation, // Match server expectation
            name, 
            text 
        });
        document.getElementById("msg").value = "";
    }
}

function sendAlert() {
    socket.emit("alert", { 
        userlocation: userLocation, // Match server expectation
        name 
    });
}

// Display messages in the chatroom
function displayMessage(msg) {
    let messageDiv = document.createElement("div");
    messageDiv.className = "p-2 bg-gray-100 rounded-lg shadow-md mb-2"; // Styling for each message
    messageDiv.textContent = msg;

    let messagesContainer = document.getElementById("messages");
    messagesContainer.appendChild(messageDiv);

    // Ensure scrollbar styling is applied
    messagesContainer.style.overflowY = "auto"; 
    messagesContainer.style.maxHeight = "320px"; // Adjust height as needed

    // Custom scrollbar styling
    messagesContainer.style.scrollbarWidth = "thin"; // For Firefox
    messagesContainer.style.scrollbarColor = "#321754 #f1f1f1"; // Violet thumb, light background

    // Add WebKit-based scrollbar styling (Chrome, Edge)
    messagesContainer.style.cssText += `
        &::-webkit-scrollbar {
            width: 8px;
        }
        &::-webkit-scrollbar-thumb {
            background-color: #321754; /* Violet scrollbar thumb */
            border-radius: 4px;
        }
        &::-webkit-scrollbar-track {
            background: #f1f1f1; /* Light background */
        }
    `;

    scrollToBottom();
}

// Display emergency alerts
function displayAlert(alertMsg) {
    let alertDiv = document.createElement("div");
    alertDiv.className = "bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-2 shadow-md";
    alertDiv.setAttribute("role", "alert");

    let boldSpan = document.createElement("span");
    boldSpan.className = "font-bold text-[15px] inline-block mr-4";
    boldSpan.textContent = "Warning!";

    let messageSpan = document.createElement("span");
    messageSpan.className = "block text-sm font-medium sm:inline max-sm:mt-2";
    messageSpan.textContent = alertMsg;

    alertDiv.appendChild(boldSpan);
    alertDiv.appendChild(messageSpan);

    document.getElementById("messages").appendChild(alertDiv);
    scrollToBottom();
}


// Auto-scroll to the bottom to show latest message/alert
function scrollToBottom() {
    let messagesDiv = document.getElementById("messages");
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}