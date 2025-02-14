import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function Game() {
    const router = useRouter();
    const { room, name } = router.query;
    const [players, setPlayers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        socket.emit("joinRoom", room, name);

        socket.on("roomUpdate", (data) => {
            setPlayers(data?.players || []);
        });

        socket.on("gameStarted", () => setGameStarted(true));

        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.disconnect();
    }, []);

    const startGame = () => socket.emit("startGame", room);
    const sendMessage = () => {
        socket.emit("sendMessage", { room, message, name });
        setMessage("");
    };

    return (
        <div className="game-container">
            <h2>Room: {room}</h2>
            <div>
                <h3>Players:</h3>
                {players.map((p, i) => (
                    <p key={i}>{p.name}</p>
                ))}
            </div>

            {!gameStarted && players.length >= 2 && (
                <button onClick={startGame}>Start Game</button>
            )}

            {gameStarted && <div className="ludo-board">🎲 LUDO GAME BOARD HERE 🎲</div>}

            <div className="chat">
                <h3>Chat</h3>
                <div className="messages">
                    {messages.map((msg, i) => (
                        <p key={i}><strong>{msg.name}:</strong> {msg.message}</p>
                    ))}
                </div>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message"
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}
