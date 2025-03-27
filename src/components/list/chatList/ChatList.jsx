import { useState, useEffect } from "react";
import "./chatList.css";

const ChatList = ({ onChatSelect }) => {
    // Check if local storage is available
    if (typeof (Storage) === "undefined") {
        console.error('Local storage is not available');
    }
    const [chats, setChats] = useState(localStorage.getItem('chats') ? JSON.parse(localStorage.getItem('chats')) : []);
    const [newChatName, setNewChatName] = useState("");

    useEffect(() => {
        // Load chats from localStorage on component mount
        try {
            const savedChats = JSON.parse(localStorage.getItem('chats')) || [];
            console.log('Loaded chats from localStorage:', savedChats);
            setChats(savedChats);
        } catch (error) {
            console.error('Error loading chats from localStorage:', error);
        }
    }, []);

    useEffect(() => {
        // Save chats to localStorage whenever chats state changes
        try {
            console.log('Saving chats to localStorage:', chats);
            localStorage.setItem('chats', JSON.stringify(chats));
        } catch (error) {
            console.error('Error saving chats to localStorage:', error);
        }
    }, [chats]);

    const handleChatClick = (id) => {
        const selectedChat = chats.find(chat => chat.id === id);
        if (selectedChat) {
            onChatSelect(selectedChat);
        }
    };
    
    const createNewChat = () => {
        if (newChatName) {
            const newChat = { id: Date.now(), name: newChatName, messages: [], markmap: "", memoryBuffer: [] };
            setChats([newChat, ...chats]);
            setNewChatName("");
        }
    };

    const removeChat = (id) => {
        const updatedChats = chats.filter(chat => chat.id !== id);
        setChats(updatedChats);
    };

    return (
        <div className="chatList">
            {/* Userinfo-Teil */}
            <div className="userInfo">
                <div className="user">
                    <img src="./avatar.png" alt="Avatar" />
                    <h2>Name</h2>
                </div>
                <div className="icons">
                    <img src="./more.png" alt="More" />
                </div>
            </div>

            {/* Create New Chat Button und Eingabefeld */}
            <div className="newChat">
                <input
                    type="text"
                    placeholder="New chat name"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)} // Chatname setzen
                />
                <button onClick={createNewChat}>Create new chat</button>
            </div>

            {/* Anzeige der Chats */}
            {chats.map((chat) => (
                <div
                    className="item"
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)} // Klick auf den Chat
                >
                    <img src="./profil.png" alt="Avatar" />
                    <div className="texts">
                        <span className="chat-name">{chat.name}</span>
                        {/* <p>{chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].message : ""}</p> */}
                        <button className="remove-button" onClick={(e) => { e.stopPropagation(); removeChat(chat.id); }}>Remove</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatList;
