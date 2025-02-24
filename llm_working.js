import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";

const llm = new ChatOllama({
  model: "llama3",
  temperature: 0,
  maxRetries: 2,
  // other params...
});

const embeddingsModel = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434/", // Ensure this is the correct URL for your local instance
});

//chat with the model
// const aiMsg = await llm.invoke([
//   [
//     "system",
//     "You are a helpful assistant that translates English to French. Translate the user sentence.",
//   ],
//   ["human", "I love programming."],
// ]);
// aiMsg;

// console.log(aiMsg.content);

//embed text
const embeddings = await embeddingsModel.embedQuery("I love programming.");
console.log(embeddings);