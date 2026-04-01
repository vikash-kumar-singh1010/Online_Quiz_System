const express = require('express');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/quizzes — list all quizzes
router.get('/', auth, async (req, res) => {
  try {
    let quizzes;
    if (req.user.role === 'admin') {
      // Admins only see their own quizzes
      quizzes = await Quiz.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    } else {
      // Students see all quizzes (without correct answers)
      quizzes = await Quiz.find().select('-questions.correctAnswer').sort({ createdAt: -1 });
    }
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/quizzes/:id — get single quiz
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // If student, check time bounds
    if (req.user.role === 'student' && quiz.isTimeBound) {
      const now = new Date();
      if (quiz.startTime && now < new Date(quiz.startTime)) {
        return res.status(403).json({ message: 'Quiz has not started yet' });
      }
      if (quiz.endTime && now > new Date(quiz.endTime)) {
        return res.status(403).json({ message: 'Quiz has expired' });
      }
    }

    if (req.user.role === 'student') {
      const existingResult = await Result.findOne({ userId: req.user._id, quizId: quiz._id });
      if (!existingResult) {
        // Strip correct answers securely since they haven't taken it yet
        const sanitizedQuiz = quiz.toObject();
        sanitizedQuiz.questions.forEach(q => {
          delete q.correctAnswer;
        });
        return res.json(sanitizedQuiz);
      }
    }

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/quizzes — create quiz (admin only)
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, description, timer, questions, isTimeBound, startTime, endTime } = req.body;

    const quiz = new Quiz({
      title,
      description,
      timer,
      questions,
      createdBy: req.user._id,
      isTimeBound: !!isTimeBound,
      startTime: isTimeBound && startTime ? new Date(startTime) : undefined,
      endTime: isTimeBound && endTime ? new Date(endTime) : undefined
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
