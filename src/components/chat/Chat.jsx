import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";


const Chat = ({ onSendMessage, chatHistory, chatHistoryTitel }) => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [messages, setMessages] = useState(chatHistory || []);
    const [ChatTitel, setChatTitel] = useState(chatHistoryTitel || "Welcome to the Chat");

    const endRef = useRef(null);
    // Scroll to the bottom of the chat when a new message is added
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    // Update the chat messages and title when the chat history changes
    useEffect(() => {
        setMessages(chatHistory);
        setChatTitel(chatHistoryTitel);
    }, [chatHistory, chatHistoryTitel]);
    // Handle the emoji click event
    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };
    // Handle the send message event
    const handleSend = async (e) => {
        if ((e.type === "keydown" && e.key === "Enter" && !e.shiftKey) || e.type === "click") {// Send the message when the Enter key is pressed without the Shift key
            e.preventDefault();
            if (text.trim()) {// Check if the message is not empty
                const newMessage = {
                    id: messages.length + 1,
                    text,
                    own: true,
                };
                setMessages((prev) => [...prev, newMessage]);// Add the new message to the chat
                setText("");// Clear the message input field

                let botMessage = {
                    id: messages.length + 2,
                    text: "",
                    own: false,
                    timestamp: "wird bearbeitet..."
                };
                setMessages((prev) => [...prev, botMessage]);// Add the new message to the chat
                // Function to update the bot message
                const updateBotMessage = (token) => {
                    botMessage.text += token;
                    setMessages((prev) => {
                        const updatedMessages = [...prev];
                        updatedMessages[updatedMessages.length - 1] = { ...botMessage, id: messages.length + 2 };
                        return updatedMessages;
                    });
                };

                const response = await onSendMessage(text, updateBotMessage);// Send the message to the server
                botMessage.text = response;
                botMessage.timestamp = "";
                setMessages((prev) => {// Add the bot response to the chat
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
                    <div className="texts">
                        <span>{ChatTitel}</span>
                    </div>
                </div>
            </div>
            <div className="center">
                {messages.map((message) => (// Render the chat messages
                    // Render the chat messages
                    <div key={message.id} className={`message ${message.own ? "own" : ""}`}>
                        {!message.own && <img src="./profil.png" alt="" />}
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
                </div>
                <textarea
                    placeholder="Type in something..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleSend}
                    rows="3"
                />
                <div className="emoji">
                    <img
                        src="./emoji.png"
                        alt="Emoji"
                        className="emoji-icon"
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