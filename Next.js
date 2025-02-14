// Install dependencies: npm install next react react-dom socket.io-client express socket.io cors

// pages/index.tsx - Home Page
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  const handleJoin = () => {
    if (name && room) {
      router.push(`/game?room=${room}&name=${name}`);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-ludo-theme">
      <h1 className="text-4xl font-bold mb-6">Nagins Games</h1>
      <input
        type="text"
        placeholder="Enter your name"
        className="p-2 border rounded mb-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room ID"
        className="p-2 border rounded mb-2"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={handleJoin} className="p-2 bg-blue-500 text-white rounded">Join Room</button>
    </div>
  );
}

// pages/game.tsx - Game Page
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

export default function Game() {
  const router = useRouter();
  const { room, name } = router.query;
  const [players, setPlayers] = useState([]);
  const [chat, setChat] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (room && name) {
      socket.emit('joinRoom', { room, name });
    }

    socket.on('updatePlayers', (playerList) => {
      setPlayers(playerList);
    });

    socket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });
  }, [room, name]);

  const sendMessage = () => {
    socket.emit('chatMessage', { room, name, message: chat });
    setChat('');
  };

  return (
    <div className="h-screen flex flex-col items-center">
      <h1 className="text-2xl">Ludo Game Room: {room}</h1>
      <div className="grid grid-cols-4 gap-2 p-4 border bg-gray-200">
        {players.map((player) => (
          <div key={player} className="p-2 bg-white border rounded">
            {player}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={chat}
        onChange={(e) => setChat(e.target.value)}
        className="p-2 border rounded mt-4"
      />
      <button onClick={sendMessage} className="p-2 bg-green-500 text-white rounded mt-2">Send</button>
      <div className="mt-4 border p-2 h-32 overflow-y-scroll w-1/2">
        {messages.map((msg, index) => (
          <p key={index}>{msg.name}: {msg.message}</p>
        ))}
      </div>
    </div>
  );
}

// server.js - Backend Server (Express + Socket.io)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

let rooms = {};

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ room, name }) => {
    if (!rooms[room]) rooms[room] = [];
    if (!rooms[room].includes(name)) rooms[room].push(name);
    io.to(room).emit('updatePlayers', rooms[room]);
    socket.join(room);
  });

  socket.on('chatMessage', ({ room, name, message }) => {
    io.to(room).emit('newMessage', { name, message });
  });
});

server.listen(4000, () => console.log('Server running on port 4000'));
