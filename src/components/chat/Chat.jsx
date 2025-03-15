import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";

const Chat = ({ onSendMessage, chatHistory }) => {
    const [open, setOpen] = useState(false); // State to manage emoji picker visibility
    const [text, setText] = useState(""); // State to manage the current text input
    const [messages, setMessages] = useState(chatHistory || []); // State to manage the chat messages

    const endRef = useRef(null); // Ref to keep track of the end of the messages for auto-scrolling

    useEffect(() => {
        // Scroll to the end of the messages whenever the messages state changes
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleEmoji = (e) => {
        // Append the selected emoji to the current text input
        setText((prev) => prev + e.emoji);
        setOpen(false); // Close the emoji picker
    };

    const handleSend = async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {// Send the message when the user presses Enter and not Shift+Enter
            e.preventDefault();
            if (text.trim()) {// Check if the text input is not empty
                // Create a new message object for the user's message
                const newMessage = {
                    id: messages.length + 1,
                    text,
                    own: true,
                    timestamp: "Just now"
                };
                setMessages((prev) => [...prev, newMessage]); // Add the user's message to the messages state
                setText(""); // Clear the text input

                // Create a placeholder for the bot's response
                let botMessage = {
                    id: messages.length + 2,
                    text: "",
                    own: false,
                    timestamp: "Just now"
                };
                setMessages((prev) => [...prev, botMessage]); // Add the bot's placeholder message to the messages state

                // Function to update the bot's message incrementally
                const updateBotMessage = (token) => {
                    botMessage.text += token;
                    setMessages((prev) => {
                        const updatedMessages = [...prev];
                        updatedMessages[updatedMessages.length - 1] = { ...botMessage, id: messages.length + 2 };
                        return updatedMessages;
                    });
                };

                // Send the user's message and get the bot's response
                const response = await onSendMessage(text, updateBotMessage);
                botMessage.text = response; // Update the bot's message with the final response
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