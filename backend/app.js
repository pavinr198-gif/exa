const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const connectDB = require("./config/db");
const feedbackRoutes = require("./routes/feedbackRoutes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/feedback', feedbackRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error(`MongoDB startup failed: ${error.message}`);
    process.exit(1);
  }
};

app.get('/', (req, res) => {
  res.send('Feedback API is running');
});

startServer();