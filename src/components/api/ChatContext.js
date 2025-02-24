import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [context, setContext] = useState("");
  const [answer, setAnswer] = useState("");

  const updateChatHistory = (newMessage) => {
    setChatHistory([...chatHistory, newMessage]);
  };

  const updateContext = (newContext) => {
    setContext(newContext);
  };

  const updateAnswer = (newAnswer) => {
    setAnswer(newAnswer);
  };

  return (
    <ChatContext.Provider value={{ chatHistory, context, answer, updateChatHistory, updateContext, updateAnswer }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);