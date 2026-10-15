const express = require('express');
const router = express.Router();

const Feedback = require('../models/feedbackModels');

// List feedback for the dashboard
router.get('/', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1, _id: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback' });
  }
});

// Create a new feedback
router.post('/', async (req, res) => {
  const { course_name, feedback_comments, feedback_rating } = req.body;

  try {
    const latestFeedback = await Feedback.findOne().sort({ course_id: -1 }).select('course_id');
    const course_id = (latestFeedback?.course_id ?? 0) + 1;
    const newFeedback = new Feedback({ course_id, course_name, feedback_comments, feedback_rating });
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({
      message: error.name === 'ValidationError' ? error.message : 'Error creating feedback',
    });
  }
});

// Update a feedback by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { course_name, feedback_comments, feedback_rating } = req.body;

  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { course_name, feedback_comments, feedback_rating },
      { new: true, runValidators: true }
    );
    if (!updatedFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json(updatedFeedback);
  } catch (error) {
    res.status(error.name === 'ValidationError' ? 400 : 500).json({
      message: error.name === 'ValidationError' ? error.message : 'Error updating feedback',
    });
  }
});

// Delete a feedback by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(id);
    if (!deletedFeedback) {
        return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting feedback' });
  }
});

module.exports = router;