import { useState } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function Home() {
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const router = useRouter();

    const joinRoom = (action) => {
        if (name && room) {
            socket.emit(action, room, name);
            router.push(`/game?room=${room}&name=${name}`);
        }
    };

    return (
        <div className="container">
            <h1>Nagins Games</h1>
            <input placeholder="Enter Name" onChange={(e) => setName(e.target.value)} />
            <input placeholder="Room ID" onChange={(e) => setRoom(e.target.value)} />
            <button onClick={() => joinRoom("createRoom")}>Create Room</button>
            <button onClick={() => joinRoom("joinRoom")}>Join Room</button>
        </div>
    );
}
