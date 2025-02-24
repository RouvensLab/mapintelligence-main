import { TextLoader} from "langchain/document_loaders/fs/text";
import {CharacterTextSplitter} from "langchain/text_splitter";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

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

const loader = new TextLoader("src/components/api/example.txt");
const docs = await loader.load();

const splitter = new CharacterTextSplitter({
    chunkSize: 200,
    chunkOverlap: 50,
});

const documents = await splitter.splitDocuments(docs);
console.log(documents);

//stores the embeddings in a faiss store int the current directory
const vectorstore = await FaissStore.fromDocuments(documents, embeddings);
await vectorstore.save("./")


//loading the embeddings from the faiss store again
import { loadQAStuffChain} from "langchain/chains";
import { createRetrievalChain } from "langchain/chains/retrieval";

const vectorstore2 = await FaissStore.load("./", embeddings);
console.log(vectorstore2);

const retrievalChain  = await createRetrievalChain({
    combineDocsChain: loadQAStuffChain(llm),
    retriever: vectorstore2.asRetriever(),
});

const res = await retrievalChain.invoke("What is the capital of France?");
console.log(res);
