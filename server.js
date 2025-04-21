const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {  
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"]
    }
});

let chatrooms = {}; // Store active chatrooms

app.use(express.static("docs")); // Serve frontend files

// Add this route below the static file serving
app.get("/chat.html", (req, res) => {
    res.sendFile(__dirname + "/docs/chat.html");
});

function capitalizeFirstLetter(str) {
    if (!str) return ""; // Return empty string if input is empty
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join", ({ name, userlocation }) => {
        userlocation = capitalizeFirstLetter(userlocation);
        if (!chatrooms[userlocation]) chatrooms[userlocation] = [];
        chatrooms[userlocation].push(socket);

        socket.join(userlocation);
        io.to(userlocation).emit("message", `${name} joined ${userlocation} chatroom.`);
    });

    socket.on("message", ({ userlocation, name, text }) => {
        io.to(capitalizeFirstLetter(userlocation)).emit("message", `${name}: ${text}`);
    });

    socket.on("alert", ({ userlocation, name }) => {
        io.to(capitalizeFirstLetter(userlocation)).emit("alert", `🚨 ALERT from ${name}!`);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
        for (let loc in chatrooms) {
            chatrooms[loc] = chatrooms[loc].filter(s => s !== socket);
        }
    });
});

server.listen(3000, () => console.log("Server running on port 3000 Link: http://localhost:3000/"));
