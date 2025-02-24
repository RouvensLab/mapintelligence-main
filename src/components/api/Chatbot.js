import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { createRetrievalChain } from "langchain/chains/retrieval";
// import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

import { ConversationChain } from "langchain/chains";

import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
    MessagesPlaceholder,

} from "@langchain/core/prompts";
import {BufferMemory} from "langchain/memory";

// ------------------------------
// 1️⃣ Initialize LLM & Embeddings
// ------------------------------

const model = new ChatOllama({
  model: "llama3",
  temperature: 0.7,
  maxRetries: 2,
  verbose: true,
});


const chatPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "The following is a friendly conversation between a human and an AI."
  ),
  new MessagesPlaceholder("history"),
  SystemMessagePromptTemplate.fromTemplate(
    "The AI is aware of the current Markmap/Mindmap: {current_markmap}"
  ),
  SystemMessagePromptTemplate.fromTemplate(
    `You are a helpful Agent who helps the user by providing clear, detailed feedback and actionable instructions for updating a Markmap.
**Instructions:**
- If the user provides an update instruction, just give the Generator Instructions at the end.
- If the user asks a question, provide a helpful response.
- Your response should be written in a natural, informal style.
**Important:** At the very end of your response, always include a separate section titled "Markmap Generator Instructions". In that section, specify exactly which branch the markmap generator should append the provided updates (for example, "Branch: Main" or any other branch name). This section must come after all general feedback.
Example:
---
Markmap Generator Instructions:
Branch: Main
- Append the following updates here: [your instructions here]`
  ),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);


const bufferMemory = new BufferMemory({
    returnMessages: true,
    memoryKey: "history",
    inputKey: "input",
});

const chain = new ConversationChain({
    memory: bufferMemory,
    llm: model,
    prompt: chatPrompt,
});

// ------------------------------
// 6️⃣ Markmap Editing Logic
// ------------------------------

const markmapStructureGuidelines = `
A Markmap is a markdown file that typically includes:
1. A YAML frontmatter delimited by --- lines that contains keys such as 'title' and 'markmap' options (e.g., colorFreezeLevel).
2. Subsequent sections defined with markdown headers (##, ###, etc.) that represent nodes.
3. Various content types such as lists, code blocks, tables, images, and links.
4. Consistent formatting and hierarchical nesting for clarity.

Example Markmap:
  ## Links
  - [Website](https://markmap.js.org/)

  ## Features
  - **strong** ~~del~~ *italic* ==highlight==
  - [x] checkbox
  - Katex: $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$ 
`;

// 🛠️ STRICT CONSTRAINTS to ensure Markmap-only responses
const editPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an assistant that updates a Markmap markdown.
**Rules:**
- Return only the updated Markmap markdown.
- Do not include any explanations or extra text.
- **Do NOT include phrases like "Final Markmap:" or "Here is the result:"**
- Directly output the modified markdown.
- If the update instruction includes a designated branch (from a section titled "Markmap Generator Instructions"), apply the updates only to that branch.
`
  ],
  ["system", "Context: {context}"],
  ["system", "Structure Guidelines:\n{structureGuidelines}"],
  ["system", "Current Markmap:\n{markmapMarkdown}"],
  ["user", "Update instruction: {input}"],
]);


const editMarkmapChain = await createStuffDocumentsChain({ llm: model, prompt: editPrompt });

// ------------------------------
// 7️⃣ Helper Function: Update Markmap
// ------------------------------

// ------------------------------
// 8️⃣ Main Agent Function
// ------------------------------

export async function mainAgent(userInput, currentMarkmapContent, live_chatresponse_function) {
    console.log("Processing user query...");

    const res = await chain.invoke(
        {
            input: userInput,
            current_markmap: currentMarkmapContent
        },
        {
            callbacks: [
                {
                    handleLLMNewToken(token) {
                        live_chatresponse_function(token);
                    }
                }
            ]
        }
    );

    const answer = String(res.response);
    console.log("LLM Response Generated.");
    console.log("Response:", answer);

    // Create document for the chain
    const documents = [{
        pageContent: answer,
        metadata: { source: "chat" }
    }];

    const updatedMarkmap = await editMarkmapChain.invoke({
        context: "",
        structureGuidelines: markmapStructureGuidelines,
        markmapMarkdown: currentMarkmapContent,
        input: answer,
        documents: documents
    });

    console.log("Updated Markmap:", updatedMarkmap);
    console.log("✅ Markmap Updated");

    // Return newMarkmap instead of updatedMarkmap to match App.jsx expectations
    return { answer, newMarkmap: updatedMarkmap };
}
