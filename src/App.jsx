import React, { useState, useEffect } from "react";
import Chat from "./components/chat/Chat";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import Graph from "./components/graph/Graph";
import { mainAgent } from "./components/api/Chatbot";
import "./components/graph/Graph.css";
import "./App.css";

const App = () => {
  const [markdown, setMarkdown] = useState(`
# Topic
## Here
### There
- Sub
- Sub
 `);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatHistoryTitel, setChatHistoryTitel] = useState("Welcome to the Chat");
  const [chatHistory, setChatHistory] = useState([]);
  const [memoryBuffer, setMemoryBuffer] = useState([]);
  const [splitterPosition, setSplitterPosition] = useState(50);
  const [editorSplitterPosition, setEditorSplitterPosition] = useState(50);
  const user = true;

  useEffect(() => {
    // Load selected chat data from localStorage on component mount
    const savedChats = JSON.parse(localStorage.getItem('chats')) || [];
    if (savedChats.length > 0) {
      const selectedChat = savedChats.find(chat => chat.id === selectedChatId) || savedChats[0];
      setSelectedChatId(selectedChat.id);
      setChatHistoryTitel(selectedChat.name);
      setMarkdown(selectedChat.markmap);
      setChatHistory(selectedChat.messages);
      setMemoryBuffer(selectedChat.memoryBuffer);
    }
  }, []);

  useEffect(() => {
    if (selectedChatId !== null) {
      const savedChats = JSON.parse(localStorage.getItem('chats')) || [];
      const selectedChat = savedChats.find(chat => chat.id === selectedChatId);
      console.log('Selected chat:', selectedChat);
      if (selectedChat) {
        setChatHistoryTitel(selectedChat.name);
        setMarkdown(selectedChat.markmap);
        setChatHistory(selectedChat.messages);
        setMemoryBuffer(selectedChat.memoryBuffer);
      }
      //reload the chat
    }
  }, [selectedChatId]);

  useEffect(() => {
    // Save selected chat data to localStorage whenever it changes
    const savedChats = JSON.parse(localStorage.getItem('chats')) || [];
    const updatedChats = savedChats.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          markmap: markdown,
          messages: chatHistory,
          memoryBuffer: memoryBuffer
        };
      }
      return chat;
    });
    console.log('Saving updated chats to localStorage:', updatedChats);
    localStorage.setItem('chats', JSON.stringify(updatedChats));
  }, [markdown, chatHistory, memoryBuffer, selectedChatId]);

  const handleSendMessage = async (message, update_Bot_stream_func) => {
    console.log("Sending message:", message);

    const response = await mainAgent(
      message,
      markdown,
      update_Bot_stream_func
    );

    console.log("Response from mainAgent:", response);
    console.log("New markmap:", response.newMarkmap);

    setChatHistory((prev) => [
      ...prev,
      { id: prev.length + 1, text: message, own: true, timestamp: "Just now" },
      { id: prev.length + 2, text: response.answer, own: false, timestamp: "Just now" },
    ]);

    if (response.newMarkmap) {
      console.log("Updating markdown with:", response.newMarkmap);
      setMarkdown(response.newMarkmap);
    }

    return response.answer;
  };

  const handleChatSelect = (chat) => {
    setSelectedChatId(chat.id);
  };

  const handleSplitterMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleSplitterMouseMove);
    document.addEventListener('mouseup', handleSplitterMouseUp);
  };

  const handleSplitterMouseMove = (e) => {
    const newPosition = (e.clientX / window.innerWidth) * 100;
    setSplitterPosition(newPosition);
  };

  const handleSplitterMouseUp = () => {
    document.removeEventListener('mousemove', handleSplitterMouseMove);
    document.removeEventListener('mouseup', handleSplitterMouseUp);
  };

  const handleEditorSplitterMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleEditorSplitterMouseMove);
    document.addEventListener('mouseup', handleEditorSplitterMouseUp);
  };

  const handleEditorSplitterMouseMove = (e) => {
    const newPosition = (e.clientY / window.innerHeight) * 100;
    setEditorSplitterPosition(newPosition);
  };

  const handleEditorSplitterMouseUp = () => {
    document.removeEventListener('mousemove', handleEditorSplitterMouseMove);
    document.removeEventListener('mouseup', handleEditorSplitterMouseUp);
  };

  return (
    <div className='container'>
      {user ? (
        <>
          <div className="splitter-container">
            <div className="splitter-panel">
              <Chat onSendMessage={handleSendMessage} chatHistory={chatHistory} chatHistoryTitel={chatHistoryTitel}/>
            </div>
            <div className="splitter" onMouseDown={handleSplitterMouseDown} />
            <div className="splitter-panel2">
              <Graph markdown={markdown} setMarkdown={setMarkdown} editorSplitterPosition={editorSplitterPosition} handleEditorSplitterMouseDown={handleEditorSplitterMouseDown} />
            </div>
          </div>
              <List onChatSelect={handleChatSelect}/>
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;