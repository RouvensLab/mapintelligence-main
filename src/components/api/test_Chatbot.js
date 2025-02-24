// This file is used to test the Chatbot API
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";


const llm = new ChatOllama({
  model: "llama3",
  temperature: 0,
  maxRetries: 2,
  // other params...
});

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434/", // Ensure this is the correct URL for your local instance
});

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  StateGraph,
  START,
  END,
  MemorySaver,
  messagesStateReducer,
  Annotation,
} from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";

const loader2 = new CheerioWebBaseLoader(
  "https://lilianweng.github.io/posts/2023-06-23-agent/"
);

// async function main() {
  const docs2 = await loader2.load();

const textSplitter2 = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const splits2 = await textSplitter2.splitDocuments(docs2);
const vectorStore2 = await MemoryVectorStore.fromDocuments(
  splits2,
  embeddings
);

// Retrieve and generate using the relevant snippets of the blog.
const retriever2 = vectorStore2.asRetriever();

const contextualizeQSystemPrompt2 =
  "Given a chat history and the latest user question " +
  "which might reference context in the chat history, " +
  "formulate a standalone question which can be understood " +
  "without the chat history. Do NOT answer the question, " +
  "just reformulate it if needed and otherwise return it as is.";

const contextualizeQPrompt2 = ChatPromptTemplate.fromMessages([
  ["system", contextualizeQSystemPrompt2],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);

const historyAwareRetriever2 = await createHistoryAwareRetriever({
  llm: llm,
  retriever: retriever2,
  rephrasePrompt: contextualizeQPrompt2,
});

const systemPrompt2 =
  "You are an assistant for question-answering tasks. " +
  "Use the following pieces of retrieved context to answer " +
  "the question. If you don't know the answer, say that you " +
  "don't know. Use three sentences maximum and keep the " +
  "answer concise." +
  "\n\n" +
  "{context}";

const qaPrompt2 = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt2],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);

const questionAnswerChain2 = await createStuffDocumentsChain({
  llm: llm,
  prompt: qaPrompt2,
});

const ragChain2 = await createRetrievalChain({
  retriever: historyAwareRetriever2,
  combineDocsChain: questionAnswerChain2,
});

// Define the State interface
// Define the State interface for the workflow, including input, chat history, context, and answer annotations
const GraphAnnotation2 = Annotation.Root({
  input: Annotation(),
  chat_history: Annotation({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  context: Annotation(),
  answer: Annotation(),
});
// The callModel2 function invokes the ragChain2 with the given state and returns the updated chat history, context, and answer.
async function callModel2(state) {
  const response = await ragChain2.invoke(state);
  return {
    chat_history: [
      new HumanMessage(state.input),
      new AIMessage(response.answer),
    ],
    context: response.context,
    answer: response.answer,
  };
}

// Create the workflow
const workflow2 = new StateGraph(GraphAnnotation2)
  .addNode("model", callModel2)
  .addEdge(START, "model")
  .addEdge("model", END);

// Compile the graph with a checkpointer object
const memory2 = new MemorySaver();
const app2 = workflow2.compile({ checkpointer: memory2 });

const threadId2 = uuidv4();
const config2 = { configurable: { thread_id: threadId2 } };

const result3 = await app2.invoke(
  { input: "What is Task Decomposition?" },
  config2
);
console.log(result3.answer);

const result4 = await app2.invoke(
  { input: "What is one way of doing it?" },
  config2
);
console.log(result4.answer);
// }

// main().catch(console.error);