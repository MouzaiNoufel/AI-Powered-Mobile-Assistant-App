const OpenAI = require('openai');
const config = require('../config');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.provider = null;
    this.isConfigured = false;
    this.initializeProvider();
  }

  initializeProvider() {
    if (config.openai.apiKey && config.openai.apiKey !== 'sk-your-openai-api-key') {
      try {
        this.provider = new OpenAI({
          apiKey: config.openai.apiKey,
        });
        this.isConfigured = true;
        logger.info('AI Service initialized with OpenAI provider');
      } catch (error) {
        logger.warn('Failed to initialize OpenAI provider, using mock mode:', error.message);
        this.isConfigured = false;
      }
    } else {
      logger.info('AI Service running in mock mode (no OpenAI API key configured)');
      this.isConfigured = false;
    }
  }

  // Build system prompt based on personality
  buildSystemPrompt(personality = 'friendly') {
    const personalities = {
      professional: `You are a professional AI assistant. Respond in a formal, business-appropriate manner. 
        Be precise, thorough, and maintain a professional tone. Focus on accuracy and clarity.`,
      
      friendly: `You are a friendly and helpful AI assistant. Be warm, approachable, and conversational. 
        Use a casual but respectful tone. Feel free to use appropriate emojis occasionally.`,
      
      concise: `You are a concise AI assistant. Provide brief, to-the-point responses. 
        Avoid unnecessary elaboration. Use bullet points when listing multiple items.`,
      
      detailed: `You are a detailed AI assistant. Provide comprehensive, thorough responses. 
        Include relevant context, examples, and explanations. Break down complex topics step by step.`,
    };

    return personalities[personality] || personalities.friendly;
  }

  // Validate and sanitize user input
  validateInput(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }

    const trimmedMessage = message.trim();
    
    if (trimmedMessage.length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (trimmedMessage.length > 10000) {
      throw new Error('Message exceeds maximum length of 10,000 characters');
    }

    return trimmedMessage;
  }

  // Build messages array for API call
  buildMessages(userMessage, conversationHistory = [], systemPrompt) {
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (last 10 messages to stay within token limits)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role !== 'system') {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }

  // Generate AI response
  async generateResponse(options) {
    const {
      message,
      conversationHistory = [],
      personality = 'friendly',
      maxTokens = config.openai.maxTokens,
    } = options;

    try {
      // Validate input
      const validatedMessage = this.validateInput(message);

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(personality);

      // Build messages
      const messages = this.buildMessages(validatedMessage, conversationHistory, systemPrompt);

      // Use real OpenAI or mock
      if (this.isConfigured) {
        return await this.callOpenAI(messages, maxTokens);
      } else {
        return await this.mockResponse(validatedMessage, personality);
      }
    } catch (error) {
      logger.error('AI generation error:', error);
      throw error;
    }
  }

  // Call OpenAI API
  async callOpenAI(messages, maxTokens) {
    try {
      const startTime = Date.now();

      const completion = await this.provider.chat.completions.create({
        model: config.openai.model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const endTime = Date.now();

      const response = completion.choices[0].message.content;
      const usage = completion.usage;

      logger.debug(`OpenAI response generated in ${endTime - startTime}ms`);

      return {
        success: true,
        response,
        tokens: {
          prompt: usage.prompt_tokens,
          completion: usage.completion_tokens,
          total: usage.total_tokens,
        },
        model: config.openai.model,
        processingTime: endTime - startTime,
      };
    } catch (error) {
      logger.error('OpenAI API error:', error);

      // Handle specific OpenAI errors
      if (error.status === 429) {
        throw new Error('AI service is currently busy. Please try again in a moment.');
      }
      if (error.status === 401) {
        throw new Error('AI service authentication failed. Please contact support.');
      }
      if (error.status === 500) {
        throw new Error('AI service is temporarily unavailable. Please try again later.');
      }

      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  // Mock response for development/testing
  async mockResponse(message, personality) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const mockResponses = {
      greeting: [
        "Hello! How can I assist you today?",
        "Hi there! I'm here to help. What would you like to know?",
        "Greetings! I'm your AI assistant. What can I do for you?",
      ],
      question: [
        "That's a great question! Based on my knowledge, here's what I can tell you...",
        "I'd be happy to help with that. Let me provide some information...",
        "Interesting query! Here's my perspective on this...",
      ],
      task: [
        "I can definitely help you with that. Here's how we can approach this...",
        "Sure! Let me break this down step by step...",
        "I'd be glad to assist. Here's what I recommend...",
      ],
      default: [
        "I understand you're asking about that topic. Here are my thoughts...",
        "Thank you for your message. Let me provide a helpful response...",
        "I appreciate your question. Here's what I can share...",
      ],
    };

    // Determine response type based on message content
    let responseType = 'default';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      responseType = 'greeting';
    } else if (lowerMessage.includes('?') || lowerMessage.match(/^(what|how|why|when|where|who|which)/)) {
      responseType = 'question';
    } else if (lowerMessage.match(/^(can you|could you|please|help me|i need|i want)/)) {
      responseType = 'task';
    }

    const responses = mockResponses[responseType];
    const baseResponse = responses[Math.floor(Math.random() * responses.length)];

    // Add personality-specific flavor
    let finalResponse = baseResponse;
    
    if (personality === 'professional') {
      finalResponse = `${baseResponse}\n\nThis response is generated in mock mode for demonstration purposes. In production, this would be a sophisticated AI-generated response tailored to your query.`;
    } else if (personality === 'friendly') {
      finalResponse = `${baseResponse} 😊\n\n[Note: This is a mock response. Connect an OpenAI API key for real AI responses!]`;
    } else if (personality === 'concise') {
      finalResponse = `${baseResponse}\n\n• Mock mode active\n• Add OpenAI key for real responses`;
    } else if (personality === 'detailed') {
      finalResponse = `${baseResponse}\n\nAdditional Context:\nThis is a mock response designed for development and testing. The AI service is currently running without an OpenAI API key configured.\n\nTo enable real AI responses:\n1. Obtain an API key from OpenAI\n2. Add it to your .env file\n3. Restart the server\n\nYour original message was: "${message}"`;
    }

    // Estimate tokens (rough approximation)
    const promptTokens = Math.ceil(message.length / 4);
    const completionTokens = Math.ceil(finalResponse.length / 4);

    return {
      success: true,
      response: finalResponse,
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens,
      },
      model: 'mock-model',
      processingTime: 500,
      isMock: true,
    };
  }

  // Check if AI service is available
  isAvailable() {
    return true; // Mock mode is always available
  }

  // Get service status
  getStatus() {
    return {
      available: true,
      provider: this.isConfigured ? 'openai' : 'mock',
      model: this.isConfigured ? config.openai.model : 'mock-model',
      configured: this.isConfigured,
    };
  }
}

// Export singleton instance
const aiService = new AIService();
module.exports = aiService;
