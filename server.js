const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let rooms = {};

io.on("connection", (socket) => {
    socket.on("createRoom", (room, name) => {
        if (!rooms[room]) rooms[room] = { players: [], host: socket.id };
        rooms[room].players.push({ id: socket.id, name });
        socket.join(room);
        io.to(room).emit("roomUpdate", rooms[room]);
    });

    socket.on("joinRoom", (room, name) => {
        if (rooms[room] && rooms[room].players.length < 4) {
            rooms[room].players.push({ id: socket.id, name });
            socket.join(room);
            io.to(room).emit("roomUpdate", rooms[room]);
        }
    });

    socket.on("startGame", (room) => {
        io.to(room).emit("gameStarted");
    });

    socket.on("sendMessage", ({ room, message, name }) => {
        io.to(room).emit("receiveMessage", { name, message });
    });

    socket.on("disconnect", () => {
        for (let room in rooms) {
            rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id);
            if (rooms[room].players.length === 0) delete rooms[room];
            io.to(room).emit("roomUpdate", rooms[room]);
        }
    });
});

server.listen(3001, () => console.log("Server running on port 3001"));
