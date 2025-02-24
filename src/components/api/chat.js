import { ConversationChain } from "langchain/chains"

import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
    MessagesPlaceholder,

} from "@langchain/core/prompts";
import {BufferMemory} from "langchain/memory";

import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";

import promptSync from "prompt-sync";
const prompt = promptSync();


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


const chatPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
        "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific information. The human is curious and asks questions.",
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const bufferMemory = new BufferMemory({ returnMessages: true, memoryKey: "history" });

const chain = new ConversationChain({
    memory: bufferMemory,
    llm: llm,
    prompt: chatPrompt,
});

async function chat() {
    //you must call the file with node src\components\api\chat.js
    while (true) {
        console.log("You: ");
        let input = prompt("You: ");
        if (input === "exit") {
            break;
        }
        const res = await chain.invoke({
            input: input,
        });
        console.log("AI: ", res.response);
    }
}

chat();
// const res = await chain.invoke({
//     input: "What is the capital of France?",
// });
// console.log(res);
// //followup call
// const res2 = await chain.invoke({
//     input: "Was can you do there?",
// });

// console.log(res2);


