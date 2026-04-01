const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: {
    type: [String],
    validate: {
      validator: (v) => v.length === 4,
      message: 'Each question must have exactly 4 options'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  }
}, { _id: false });

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Quiz description is required'],
    trim: true
  },
  timer: {
    type: Number,
    required: [true, 'Timer is required'],
    min: 1
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: (v) => v.length > 0,
      message: 'Quiz must have at least one question'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isTimeBound: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
