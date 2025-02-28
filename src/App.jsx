import React, { useState } from "react";
import Chat from "./components/chat/Chat";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import Graph from "./components/graph/Graph";
import { mainAgent } from "./components/api/Chatbot";

/**
 * App component that serves as the main entry point for the application.
 * 
 * @component
 * 
 * @example
 * return (
 *   <App />
 * )
 * 
 * @returns {JSX.Element} The rendered component.
 * 
 * @description
 * The App component manages the state for markdown content and chat history.
 * It conditionally renders different components based on the user's authentication status.
 * 
 * @state {string} markdown - The markdown content used for rendering the graph.
 * @state {Array} chatHistory - The history of chat messages.
 * 
 * @param {boolean} user - A boolean indicating if the user is authenticated.
 * 
 * @function handleSendMessage
 * @description Sends a message to the main agent and updates the chat history and markdown content.
 * @param {string} message - The message to be sent.
 * @param {function} update_Bot_stream_func - A function to update the bot stream.
 * @returns {Promise<string>} The response answer from the main agent.
 */

const App = () => {
  //const [topMarkdown, setTopMarkdown] = useState(``);
  const [markdown, setMarkdown] = useState(` 
---
title: Mindmap Title
markmap:
  colorFreezeLevel: 2
---

# Topic
## Here
### There
- Sub
- Sub
 `);
 
  const [chatHistory, setChatHistory] = useState([]);
  const user = true;
  

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

  return (
    <div className='container'>
      {user ? (
        // Chatinterface
        <>
          <List/>
          <Chat onSendMessage={handleSendMessage} chatHistory={chatHistory} />
          <Graph markdown={markdown} />
        </>
      ) : (
        // Login interface
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;