import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";

const Chat = ({ onSendMessage, chatHistory }) => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [messages, setMessages] = useState(chatHistory || []);

    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleSend = async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (text.trim()) {
                const newMessage = {
                    id: messages.length + 1,
                    text,
                    own: true,
                    timestamp: "Just now"
                };
                setMessages((prev) => [...prev, newMessage]);
                setText("");

                let botMessage = {
                    id: messages.length + 2,
                    text: "",
                    own: false,
                    timestamp: "Just now"
                };
                setMessages((prev) => [...prev, botMessage]);

                const updateBotMessage = (token) => {
                    botMessage.text += token;
                    setMessages((prev) => {
                        const updatedMessages = [...prev];
                        updatedMessages[updatedMessages.length - 1] = { ...botMessage, id: messages.length + 2 };
                        return updatedMessages;
                    });
                };

                const response = await onSendMessage(text, updateBotMessage);
                botMessage.text = response;
                setMessages((prev) => {
                    const updatedMessages = [...prev];
                    updatedMessages[updatedMessages.length - 1] = { ...botMessage, id: messages.length + 2 };
                    return updatedMessages;
                });
            }
        }
    };

    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Jane Doe</span>
                        <p>I love it when you call me Señorita.</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            <div className="center">
                {messages.map((message) => (
                    <div key={message.id} className={`message ${message.own ? "own" : ""}`}>
                        {!message.own && <img src="./avatar.png" alt="" />}
                        <div className="texts">
                            <pre className="message-text">{message.text}</pre>
                            <span>{message.timestamp}</span>
                        </div>
                    </div>
                ))}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <img src="./img.png" alt="" />
                    <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" />
                </div>
                <textarea
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleSend}
                    rows="3"
                />
                <div className="emoji">
                    <img
                        src="./emoji.png"
                        alt=""
                        onClick={() => setOpen((prev) => !prev)}
                    />
                    {open && (
                        <div className="picker">
                            <EmojiPicker onEmojiClick={handleEmoji} />
                        </div>
                    )}
                </div>
                <button className="sendButton" onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default Chat;