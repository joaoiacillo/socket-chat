const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
const socket = require("socket.io")(server);

// Modify this if you want a different port to be used as localhost port
//                               ↓↓↓↓
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// Uses the root route to render the chat website app
app.use("/", (req, res) => {
    res.render("index.html");
});

// Warns when socket.io was connected
socket.on("connect", function () {
    console.log("[?] Socket.io is connected and waiting for messages.");
});

const messages = [];

// Fires when any socket connects to the server
socket.on("connection", function (socket) {
    // The socket id
    let socketId = socket.id;
    // The date and time the socket connected
    let socketConnectionTime = new Date();

    console.log(
        `[!] New socket connected at ${socketConnectionTime}: ${socketId}`
    );

    socket.emit("cached", messages);

    // Fires when this specific socket connection sent a message
    socket.on("message", function (query) {
        console.log(`[!] New message sent by ${query.author}, at ${query.at}: ${query.content}`);
        // Caches the message so it can be reached by new socket connections
        messages.push(query);
        // Respond to the message sending the same message but to the other
        // connected sockets.
        socket.broadcast.emit("message", query);
    });

    // Warns when this specific socket disconnectes from the server
    socket.on("disconnect", function () {
        // The date and time the socket disconnected
        let socketDisconnectionTime = new Date();

        console.log(
            `[!] Socket disconnected at ${socketDisconnectionTime}: ${socketId}`
        );
    });
});

// Listens to the port and warns when it was done successfully
server.listen(port, function () {
    console.log(
        `The server is listening on the port: http://localhost:${port}`
    );
});
