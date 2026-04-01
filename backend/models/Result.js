const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  warnings: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Ensure a student can only take a quiz once
resultSchema.index({ userId: 1, quizId: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
