const express = require('express');
const Result = require('../models/Result');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/results — submit quiz result
router.post('/', auth, async (req, res) => {
  try {
    const { quizId, answers, warnings, timeTaken } = req.body;

    // Check if already submitted
    const existing = await Result.findOne({ userId: req.user._id, quizId });
    if (existing) {
      return res.status(400).json({ message: 'You have already taken this quiz' });
    }

    // Fetch quiz data for bounds checking AND score calculation
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.isTimeBound) {
      const now = new Date();
      if (quiz.startTime && now < new Date(quiz.startTime)) {
        return res.status(403).json({ message: 'Quiz has not started yet' });
      }
      if (quiz.endTime && now > new Date(quiz.endTime)) {
        return res.status(403).json({ message: 'Quiz has expired' });
      }
    }

    // SERVER-SIDE SCORE CALCULATION
    let calculatedScore = 0;
    const totalQuestions = quiz.questions.length;
    quiz.questions.forEach((q, index) => {
      // answers object format: { "0": 1, "1": 3, ... }
      if (answers && answers[index] === q.correctAnswer) {
        calculatedScore += 1;
      }
    });

    const result = new Result({
      userId: req.user._id,
      quizId,
      score: calculatedScore,
      total: totalQuestions,
      answers,
      warnings: warnings || 0,
      timeTaken: timeTaken || 0
    });

    await result.save();
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already taken this quiz' });
    }
    res.status(500).json({ message: err.message });
  }
});

// GET /api/results/user — get results for current user
router.get('/user', auth, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/results/quiz/:quizId — get all results for a quiz (with user names)
router.get('/quiz/:quizId', auth, async (req, res) => {
  try {
    const results = await Result.find({ quizId: req.params.quizId })
      .sort({ score: -1, timeTaken: 1 });

    // Enrich with user names
    const enrichedResults = await Promise.all(
      results.map(async (r) => {
        const user = await User.findById(r.userId).select('name');
        return {
          ...r.toObject(),
          userName: user ? user.name : 'Anonymous'
        };
      })
    );

    res.json(enrichedResults);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
