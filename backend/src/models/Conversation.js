const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tokens: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'New Conversation',
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  messages: [messageSchema],
  metadata: {
    model: {
      type: String,
      default: 'gpt-4',
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    personality: {
      type: String,
      enum: ['professional', 'friendly', 'concise', 'detailed'],
      default: 'friendly',
    },
    category: {
      type: String,
      enum: ['general', 'coding', 'writing', 'analysis', 'creative', 'other'],
      default: 'general',
    },
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
  },
  isStarred: {
    type: Boolean,
    default: false,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
conversationSchema.index({ user: 1, createdAt: -1 });
conversationSchema.index({ user: 1, status: 1 });
conversationSchema.index({ user: 1, isStarred: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Virtual for message count
conversationSchema.virtual('messageCount').get(function() {
  return this.messages ? this.messages.length : 0;
});

// Virtual for last message preview
conversationSchema.virtual('lastMessagePreview').get(function() {
  if (this.messages && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    return lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : '');
  }
  return '';
});

// Pre-save middleware to update lastMessageAt and generate title
conversationSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp || new Date();
    
    // Auto-generate title from first user message if still default
    if (this.title === 'New Conversation') {
      const firstUserMessage = this.messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        this.title = firstUserMessage.content.substring(0, 50) + 
          (firstUserMessage.content.length > 50 ? '...' : '');
      }
    }
  }
  next();
});

// Static method to get user's conversations with pagination
conversationSchema.statics.getUserConversations = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status = 'active',
    isStarred,
    category,
    search,
  } = options;

  const query = { user: userId, status };
  
  if (isStarred !== undefined) {
    query.isStarred = isStarred;
  }
  
  if (category) {
    query['metadata.category'] = category;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { 'messages.content': { $regex: search, $options: 'i' } },
    ];
  }

  const conversations = await this.find(query)
    .sort({ lastMessageAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-messages')
    .lean();

  const total = await this.countDocuments(query);

  return {
    conversations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Method to add a message to conversation
conversationSchema.methods.addMessage = function(role, content, tokens = 0) {
  this.messages.push({
    role,
    content,
    tokens,
    timestamp: new Date(),
  });
  
  this.metadata.totalTokens += tokens;
  this.lastMessageAt = new Date();
  
  return this;
};

// Method to get conversation summary
conversationSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    messageCount: this.messageCount,
    lastMessagePreview: this.lastMessagePreview,
    lastMessageAt: this.lastMessageAt,
    isStarred: this.isStarred,
    category: this.metadata.category,
    createdAt: this.createdAt,
  };
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
