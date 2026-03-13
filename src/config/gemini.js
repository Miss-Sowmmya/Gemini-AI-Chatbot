import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
    
    this.chat = null;
  }

  initializeChat() {
    this.chat = this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });
  }

  async sendMessage(message) {
    try {
      if (!this.chat) {
        this.initializeChat();
      }

      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(error.message || 'Failed to send message');
    }
  }

  async sendMessageWithStream(message, onChunk) {
    try {
      if (!this.chat) {
        this.initializeChat();
      }

      const result = await this.chat.sendMessageStream(message);
      let fullResponse = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        onChunk(chunkText, fullResponse);
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Error in stream:', error);
      throw new Error(error.message || 'Failed to stream message');
    }
  }

  async generateContent(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error(error.message || 'Failed to generate content');
    }
  }
}

export default GeminiService;