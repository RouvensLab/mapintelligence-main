import React, { useState } from "react";
import Chat from "./components/chat/Chat";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import Graph from "./components/graph/Graph";
import { mainAgent } from "./components/api/Chatbot";

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
        <>
          <List/>
          <Chat onSendMessage={handleSendMessage} chatHistory={chatHistory} />
          <Graph markdown={markdown} />
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;