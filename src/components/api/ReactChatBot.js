import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// Load chat history and Markmap from local storage
const loadFromLocalStorage = (key, defaultValue) => {
  return JSON.parse(localStorage.getItem(key)) || defaultValue;
};

// Save to local storage
const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize Chat Model
const model = new ChatOllama({
  model: "llama3",
  temperature: 0.7,
  maxRetries: 2,
});

// Embeddings for retrieval-based memory
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434/",
});

// Vector store to save past interactions as embeddings
const vectorstore = new MemoryVectorStore(embeddings);
const retriever = vectorstore.asRetriever({ k: 3 });

// **Retriever chain** This returns the most relevant past interactions
const example_chat_history = [
    "Hello, my name is Kevin. How can I help you today?",
    "Hello, I am an AI assistant. How can I help you today?",
    ];
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
const docs = await splitter.splitDocuments(example_chat_history);


    

const chatChain = await createStuffDocumentsChain({
  llm: model,
  prompt: chatPrompt,
  documentPrompt: ChatPromptTemplate.fromTemplate("{pagecontent}"), // Fix: Define 'context'
});

// **Markmap update chain (ensuring 'context' exists)**
const markmapPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are an assistant that updates a Markmap markdown based on the conversation.",
  ],
  //new MessagesPlaceholder("chat_history"),
  ["system", "Current Markmap:\n{markmapMarkdown}"],
  ["system", "Current chat history:\n{context}"],
  ["user", "Update the Markmap with:\n{input}"],
]);

const markmapChain = await createStuffDocumentsChain({
  llm: model,
  prompt: markmapPrompt,
  documentPrompt: ChatPromptTemplate.fromTemplate("{pagecontent}"), // Fix: Define 'context'
});

const serializeChatHistory = (chatHistory) =>
    chatHistory.map(m => m.text || m).join("\n");

// **Main Agent Function**
export const mainAgent = async (userMessage, currentMarkmap, updateBotStreamFunc) => {
  const chatHistory = loadFromLocalStorage("chatHistory", [
    new HumanMessage("Hello, my name is kevin. How can I help you today?"),
    new AIMessage("Hello, I am an AI assistant. How can I help you today?"),
  ]);
  chatHistory.push(new HumanMessage(userMessage));

  //onsole.log("Processing user query...");
  console.log("Chat history:", chatHistory);

  // **Retrieve relevant past interactions**
  const retrievedDocs = await retrieverChain.invoke({
    chat_history: serializeChatHistory(chatHistory),
    input: userMessage,
  });
  console.log("Retrieved docs:", retrievedDocs);

  // **Pass retrieved history as context**
  const aiResponse = await chatChain.invoke({
    input: userMessage,
    context: retrievedDocs,
    }, {callbacks: [
        {
          handleLLMNewToken(token) {
            updateBotStreamFunc(token);
          }
        }
      ]});

  chatHistory.push(new AIMessage(aiResponse));

  // **Update Markmap**
  const newMarkmap = await markmapChain.invoke({
    chat_history: chatHistory,
    markmapMarkdown: currentMarkmap,
    input: userMessage,
    context: currentMarkmap, // Fix: Provide 'context'
  });

  // **Save updated chat history and Markmap**
  saveToLocalStorage("chatHistory", chatHistory);
  saveToLocalStorage("markmap", newMarkmap);

  // **Return response & updates for UI**
  return {
    answer: aiResponse,
    updatedChatHistory: chatHistory,
    newMarkmap,
  };
};
