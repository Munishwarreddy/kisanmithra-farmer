const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatbotService {
  constructor() {
    this.genAI = null;
    this.model = null;
    
    this.systemInstruction = `
      You are the official AI Assistant for KisanMithra, a platform that connects local Indian farmers directly with consumers, eliminating middlemen.
      Your tone should be helpful, respectful, and supportive.
      
      Key features of the platform you can help users with:
      - Farmers can list their products (vegetables, fruits, grains, pulses, spices).
      - Consumers can browse and buy products directly from farmers.
      - Real-time messaging with automatic translation between English, Telugu, and Hindi.
      - AI Deal Summaries that automatically extract deal terms (Product, Quantity, Price, Delivery Date) from chat conversations.
      - Sentiment Analysis on messages to help farmers understand consumer tone.
      - AI-powered price predictions based on market data.
      
      Always provide concise, clear answers. If you do not know something, politely inform them that you are an AI assistant and they can contact human support for further details.
    `;

    this._initIfReady();
  }

  _initIfReady() {
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
      // Use gemini-2.5-flash since 1.5 is no longer supported on this API key tier
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: this.systemInstruction
      });
    }
  }

  /**
   * Process a chat message from a user and return the AI's response.
   * Maintains conversation history to provide contextual answers.
   * 
   * @param {string} userMessage - The latest message from the user
   * @param {Array} history - Array of previous message objects
   */
  async processChat(userMessage, history = []) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key is not configured.");
      }

      // Start a chat session
      const chat = this.model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      // Send the user's message
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      
      return {
        success: true,
        text: response.text(),
      };
    } catch (error) {
      console.error('ChatbotService Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate response'
      };
    }
  }
}

module.exports = new ChatbotService();
