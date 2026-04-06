"use client";
import { useState } from "react";
import styles from "./Chat.module.css";

export default function Chat({ streamId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  async function sendMessage(e) {
    e.preventDefault();
    if (!input) return;
    // Replace with real backend logic (e.g., WebSocket or API)
    setMessages([...messages, { text: input, user: "You" }]);
    setInput("");
  }

  return (
    <div className={styles.chatContainer}>
      <h3>Chat</h3>
      <div className={styles.chatMessages}>
        {messages.map((msg, i) => (
          <div key={i}>
            <b>{msg.user}:</b> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
