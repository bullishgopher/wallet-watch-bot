// import fs from 'fs';
// import { OpenAI } from 'langchain/llms/openai';
// import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
// import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
// import { RetrievalQAChain, loadQARefineChain } from 'langchain/chains';
// import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { config } from '../utils/env.js';

const { OpenAI } = require('langchain/llms/openai');
const { RetrievalQAChain, loadQARefineChain } = require('langchain/chains');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { HNSWLib } = require('langchain/vectorstores/hnswlib');
const fs = require('fs');

const model = new OpenAI({
  openAIApiKey: config.openai.apiKey,
  temperature: 0.9,
});

export async function getAnswer(question: string) {
  try {
    const vectorStore = await HNSWLib.load(
      'hnswlib',
      new OpenAIEmbeddings({ openAIApiKey: config.openai.apiKey }),
    );

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadQARefineChain(model),
      retriever: vectorStore.asRetriever(),
    });

    const result = await chain.call({
      query: question,
    });

    return result.output_text;
  } catch (error) {
    return ':exploding_head: I am confused. Please ask me anything again.';
  }
}

export async function trainBot() {
  try {
    const trainingText = fs.readFileSync(
      '../../assets/training-data.txt',
      'utf8',
    );
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const docs = await textSplitter.createDocuments([trainingText]);

    const vectorStore = await HNSWLib.fromDocuments(
      docs,
      new OpenAIEmbeddings({ openAIApiKey: config.openai.apiKey }),
    );
    vectorStore.save('hnswlib');
    return 'I am super good at learning new things :sweat_smile:';
  } catch (error) {
    return 'I am sorry, I am sleepy :sleepy:';
  }
}
