import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { createRetrievalChain } from "langchain/chains/retrieval";
// import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
// import { HumanMessage, AIMessage } from "@langchain/core/messages";

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
  SystemMessagePromptTemplate.fromTemplate("The following is a friendly conversation between a human and an AI."),
  new MessagesPlaceholder("history"),
  SystemMessagePromptTemplate.fromTemplate("The AI is aware of the current Markmap/Mindmap: {current_markmap}"),
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

// tools: 
// const tools = [
//     // function for the first message that says if the next llm should update the markmap
//     new DynamicTool({
//       name: "update-markmap",
//       description:
//         "call this if some changes should be done to the markmap",
//       func: async () => {"update-markmap"},
//     }),
//   ];


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

// ------------------------------
// 1️⃣ Markmap Structure Guidelines
// ------------------------------
const markmapStructureGuidelines = `
# Markmap Structure Guidelines
- Die Ausgabe muss im Markmap-kompatiblen Markdown-Format erfolgen.
- Hauptthemen sind fett formatiert (z. B. **Thema**) und sollten, wenn passend, mit einem SVG-Icon versehen werden (z. B. ![](cliparts/icon.svg)).
- Verwende eingerückte Listen für Unterthemen, um die hierarchische Beziehung deutlich zu machen.
- Achte darauf, dass alle Ebenen korrekt formatiert sind – keine zusätzlichen Erklärungen oder Kommentare in der Ausgabe.
- Beispiel:
  \`
  # Geschichte Indiens
  - ![Map](cliparts/map.svg) **Indien in der Geschichte**
  - ![Idea](cliparts/Idee.svg) **Einleitung**
   - **Bevölkerungsreich**, **alte Zivilisation**, **Weltreligionen**
   - **Politische Geschichte**
   - **Unabhängigkeit**
  \`
`;

//provieds the list with all possible svg files that can be inplemented in the markmap

const svgListString = `
(cliparts/ArrowDown.svg)
(cliparts/ArrowLeft.svg)
(cliparts/ArrowRight.svg)
(cliparts/ArrowUp.svg)
(cliparts/BevölkerungUndSteigend.svg)
(cliparts/Brücke.svg)
(cliparts/Citation.svg)
(cliparts/Danger.svg)
(cliparts/decrease.svg)
(cliparts/equilibrium.svg)
(cliparts/Idee.svg)
(cliparts/knot.svg)
(cliparts/Kreislauf.svg)
(cliparts/map.svg)
(cliparts/Notes.svg)
(cliparts/OneOfTreeStars.svg)
(cliparts/Politic.svg)
(cliparts/python_get_list.py)
(cliparts/Route_From_there_to_there.svg)
(cliparts/Seulendiagramm.svg)
(cliparts/SeulendiagrammSinkend.svg)
(cliparts/SeulendiagrammSteigend.svg)
(cliparts/Sprechblase.svg)
(cliparts/strenght.svg)
(cliparts/Sycle.svg)
(cliparts/threeOfThreeStars.svg)
(cliparts/thumbDown.svg)
(cliparts/thumbUP.svg)
(cliparts/twoOfthreeStars.svg)
`;


// ------------------------------
// 2️⃣ Edit Prompt für Markmap-Updates
// ------------------------------
const editPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Du bist ein Assistent, der Markmaps im Markdown-Format aktualisiert. 
Deine Aufgabe ist es, basierend auf der Update-Anweisung den vorhandenen Markmap-Inhalt zu modifizieren.
**Regeln:**
- Gib ausschließlich den aktualisierten Markmap-Markdown-Code aus.
- Füge keine zusätzlichen Erklärungen oder Kommentare ein.
- Verwende, wenn möglich, die vorgegebenen SVG-Icons.
- Wenn in der Update-Anweisung ein spezifischer Branch genannt wird (in einem separaten Abschnitt "Markmap Generator Instructions"), wende die Änderungen ausschließlich auf diesen Branch an.
`
  ],
  [
    "system",
    "Kontext: {context}"
  ],
  [
    "system",
    "Structure Guidelines:\n{structureGuidelines}"
  ],
  [
    "system",
    "Liste der verfügbaren SVGs:\n{svgList}"
  ],
  [
    "system",
    "Aktueller Markmap-Inhalt:\n{markmapMarkdown}"
  ],
  [
    "user",
    "Update-Anweisung: {input}"
  ]
]);


const editMarkmapChain = await createStuffDocumentsChain({ llm: model, prompt: editPrompt });

// ------------------------------
// 7️⃣ Helper Function: Update Markmap
// ------------------------------

// ------------------------------
// 8️⃣ Main Agent Function
// ------------------------------


//make a dummy function, to save time. thiss will always return the same response
// export async function mainAgent(userInput, currentMarkmapContent, live_chatresponse_function) {
//     return {
//         answer: "This is a dummy response.",
//         newMarkmap: "## Dummy Markmap\n- This is a dummy markmap content."
//     };
// }


export async function mainAgent(userInput, currentMarkmapContent, live_chatresponse_function, live_markmapresponse_function) {
    console.log("Processing user query...");
    // set the using tool variable to false
    // let usingTool = false;

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

    // Creates document for the chain
    const documents = [{
        pageContent: answer,
        metadata: { source: "chat" }
    }];

    // // if the response is "update-markmap" the usingTool variable will be set to true
    // if (answer === "update-markmap") {

    const updatedMarkmap = await editMarkmapChain.invoke({
        context: "",
        structureGuidelines: markmapStructureGuidelines,
        markmapMarkdown: currentMarkmapContent,
        svgList: svgListString,
        input: answer,
        documents: documents
    }, 
    {
        callbacks: [
            {
                handleLLMNewToken(token) {
                    live_markmapresponse_function(token);
            }
        }

        ]
    });

    console.log("Updated Markmap:", updatedMarkmap);
    console.log("✅ Markmap Updated");

    // Return newMarkmap instead of updatedMarkmap to match App.jsx expectations
    return { answer, newMarkmap: updatedMarkmap };
}
