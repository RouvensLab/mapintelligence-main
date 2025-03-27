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


  const [splitterPositionV, setSplitterPositionV] = useState(50);
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
  // Compare this snippet
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


  //function that is called to update the markmap
  const update_Markmap_stream_func = (newMarkmap) => {
    console.log("Updating markmap with:", newMarkmap);
    setMarkdown(newMarkmap);
  };

  // getting the response from the bot and updating all the necessary states
  const handleSendMessage = async (message, update_Bot_stream_func) => {
    console.log("Sending message:", message);
    // Send the message to the bot and get the response. update_Bot_stream_func is a function that updates the bot message in the chat
    const response = await mainAgent(
      message,
      markdown,
      update_Bot_stream_func,
      update_Markmap_stream_func
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
  //function that handles the chat selection
  const handleChatSelect = (chat) => {
    setSelectedChatId(chat.id);
  };

  //handle the splitter mouse down event
  const handleSplitterMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleSplitterMouseMove);
    document.addEventListener('mouseup', handleSplitterMouseUp);
  };
  //handle the splitter mouse move event
  const handleSplitterMouseMove = (e) => {
    const newPosition = (e.clientX / window.innerWidth) * 100;
    setSplitterPositionV(newPosition);
  };
  //handle the splitter mouse up event
  const handleSplitterMouseUp = () => {
    document.removeEventListener('mousemove', handleSplitterMouseMove);
    document.removeEventListener('mouseup', handleSplitterMouseUp);
  };


  //handle the editor splitter mouse down event
  const handleEditorSplitterMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleEditorSplitterMouseMove);
    document.addEventListener('mouseup', handleEditorSplitterMouseUp);
  };
  //handle the editor splitter mouse move event
  const handleEditorSplitterMouseMove = (e) => {
    const newPosition = (e.clientY / window.innerHeight) * 100;
    setEditorSplitterPosition(newPosition);
  };
  //handle the editor splitter mouse up event
  const handleEditorSplitterMouseUp = () => {
    document.removeEventListener('mousemove', handleEditorSplitterMouseMove);
    document.removeEventListener('mouseup', handleEditorSplitterMouseUp);
  };

  return (
    <div className='container'>
      {user ? (
        <>
          <div className="splitter-container" style={{ gridTemplateColumns: `${splitterPositionV}% 5px ${100 - splitterPositionV}% 5px` }}>
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