import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// ------------------------------
// Setup for Conversation Chain
// ------------------------------

const model = new ChatOllama({
  model: "llama3",
  temperature: 0,
  maxRetries: 2,
  // other params...
});

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434/", // Ensure this is the correct URL for your local instance
});

// Use Cheerio to scrape content from a webpage and create documents
const loader = new CheerioWebBaseLoader(
  "https://js.langchain.com/docs/how_to/#langchain-expression-language-lcel"
);
const docs = await loader.load();

// Text Splitter
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 100,
  chunkOverlap: 20,
});
const splitDocs = await splitter.splitDocuments(docs);

// Create Vector Store
const vectorstore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

// Create a retriever from the vector store
const retriever = vectorstore.asRetriever({ k: 2 });

// Create a HistoryAwareRetriever that generates a search query based on both
// the user input and the chat history
const retrieverPrompt = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder("chat_history"),
  ["user", "{input}"],
  [
    "user",
    "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
  ],
]);
const retrieverChain = await createHistoryAwareRetriever({
  llm: model,
  retriever,
  rephrasePrompt: retrieverPrompt,
});

// Fake chat history for testing (commented out as it's not used)
// const chatHistory = [
//   new HumanMessage("What does LCEL stand for?"),
//   new AIMessage("LangChain Expression Language"),
// ];

// Define the prompt for the final answer chain
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Answer the user's questions based on the following context: {context}."],
  new MessagesPlaceholder("context"),
  new MessagesPlaceholder("chat_history"),
  ["user", "{input}"],
]);

// Create the chain to combine documents and generate an answer
const chain = await createStuffDocumentsChain({
  llm: model,
  prompt: prompt,
});

const conversationChain = await createRetrievalChain({
  combineDocsChain: chain,
  retriever: retrieverChain,
});

// Test conversation chain (commented out as it's not used)
// const response = await conversationChain.invoke({
//   chat_history: chatHistory,
//   input: "What is it?",
// });
// console.log("Answer from conversation chain:", response);

// // Test conversation chain
// const response = await conversationChain.invoke({
//   chat_history: chatHistory,
//   input: "What is it?",
// });
// console.log("Answer from conversation chain:", response);

// ------------------------------
// New: Markmap Editing Logic (Updated)
// ------------------------------

// A tool or constant providing guidelines on how to structure Markmap content.
const markmapStructureGuidelines = `
A Markmap is a markdown file that typically includes:
1. A YAML frontmatter delimited by --- lines that contains keys such as 'title' and 'markmap' options (e.g., colorFreezeLevel).
2. Subsequent sections defined with markdown headers (##, ###, etc.) that represent nodes.
3. Various content types such as lists, code blocks, tables, images, and links.
4. Consistent formatting and hierarchical nesting for clarity.
`;

// Create a prompt template for editing the Markmap.
// Note: We now include a "context" variable (which can be an empty string) to satisfy the chain's requirement.
const editPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are an assistant that updates a Markmap markdown. Use the guidelines below on how to structure Markmap content, the current Markmap (which may be empty), and the user's instruction to generate an updated Markmap markdown."
  ],
  // Add a context placeholder here.
  ["system", "Context: {context}"],
  ["system", "Structure Guidelines:\n{structureGuidelines}"],
  ["system", "Current Markmap:\n{markmapMarkdown}"],
  ["user", "Update instruction: {input}"],
]);

// Create the chain that handles Markmap editing.
const editMarkmapChain = await createStuffDocumentsChain({
  llm: model,
  prompt: editPrompt,
});

// Helper function to update the Markmap.
// It accepts both the user's edit instruction and the current Markmap content.
async function updateMarkmap(editInstruction, currentMarkmapContent) {
  const updatedMarkmap = await editMarkmapChain.invoke({
    context: "", // Provide an empty context if not needed.
    structureGuidelines: markmapStructureGuidelines,
    markmapMarkdown: currentMarkmapContent,
    input: editInstruction,
  });
  console.log("Updated Markmap:", updatedMarkmap);
  return updatedMarkmap;
}

// Example usage: starting with an empty Markmap (or you can use existing content)
const initialMarkmap = ""; // Starting with an empty Markmap

// User requests to append a new section "Contact Info"
updateMarkmap(
  "Append a new section titled 'Contact Info' with an email link 'mailto:info@example.com'.",
  initialMarkmap
);
