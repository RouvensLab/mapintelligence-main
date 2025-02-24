//import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { ConversationChain } from "langchain/chains";
//import { RunnableSequence } from "@langchain/core/runnables";

// Memory
import { BufferMemory } from "langchain/memory";
//import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";

// ------------------------------
// 1️⃣ Initialize LLM & Embeddings
// ------------------------------
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
const model = new ChatOllama({
  model: "llama3",
  temperature: 0.7,
  maxRetries: 2,
  verbose: true,
});

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434/", // Ensure this is the correct URL for your local instance
});
// ------------------------------
// 2️⃣ History-Aware Retriever
// ------------------------------


const prompt = ChatPromptTemplate.fromTemplate(`
You are an AI assistant called Max. You are here to help answer questions and provide information to the best of your ability.
Chat History: {history}
{input}`);

// const upstashMessageHistory = new UpstashRedisChatMessageHistory({
//   sessionId: "mysession",
//   config: {
//     url: process.env.UPSTASH_REDIS_URL,
//     token: process.env.UPSTASH_REST_TOKEN,
//   },
// });
const MessageHistory = [
  {
    id: "1",
    text: "Hello, my name is Kevin. How can I help you today?",
    own: false,
    timestamp: "Just now",
  },
];


const memory = new BufferMemory({
  memoryKey: "history",
  //chatHistory: MessageHistory,
});

//Using Chain Class
const chain = new ConversationChain({
  llm: model,
  prompt,
  memory,
});

const response = await chain.invoke({ 
  input: "The passphrase is HELLOWORLD"
});
console.log(response);

const response2 = await chain.invoke({ 
  input: "What is the passphrase?"
});
console.log(response2);

console.log("Updated Chat Memory", await memory.loadMemoryVariables());


// Using LCEL
// const chain = prompt.pipe(model);
// const chain = RunnableSequence.from([
//   {
//     input: (initialInput) => initialInput.input,
//     memory: () => memory.loadMemoryVariables({}),
//   },
//   {
//     input: (previousOutput) => previousOutput.input,
//     history: (previousOutput) => previousOutput.memory.history,
//   },
//   prompt,
//   model,
// ]);

// Testing Responses

// console.log("Initial Chat Memory", await memory.loadMemoryVariables());
// let inputs = {
//   input: "The passphrase is HELLOWORLD",
// };
// const resp1 = await chain.invoke(inputs);
// console.log(resp1);
// await memory.saveContext(inputs, {
//   output: resp1.content,
// });

// console.log("Updated Chat Memory", await memory.loadMemoryVariables());

// let inputs2 = {
//   input: "What is the passphrase?",
// };

// const resp2 = await chain.invoke(inputs2);
// console.log(resp2);
// await memory.saveContext(inputs2, {
//   output: resp2.content,
// });