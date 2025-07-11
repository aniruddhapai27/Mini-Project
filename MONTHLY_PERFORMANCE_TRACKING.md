# Monthly Performance Tracking Implementation

## Frontend Changes ✅ COMPLETED

The QuizPerformanceGraph component has been updated to support monthly performance tracking with the following features:

### New Features Added:

1. **View Type Toggle**: Users can switch between "All-Time Performance" and "Current Month Performance"
2. **Monthly Reset Indicator**: Shows current month and days remaining until reset
3. **Visual Distinctions**: Monthly view has purple color scheme and special indicators
4. **Enhanced Cards**: Show whether data is for current month or all-time
5. **Empty State Handling**: Different messages for monthly vs all-time views

### UI Enhancements:

- Purple color scheme for monthly view (purple progress bars, borders, indicators)
- Monthly performance cards have a subtle purple ring border
- Current month indicator in tooltips and headers
- Countdown showing days until monthly reset

## Backend Changes Required ⚠️ TODO

To fully implement monthly performance tracking, the following backend changes are needed:

### 1. Database Schema Updates

#### Add Monthly Stats to User Quiz History:

```javascript
// In userModel.js or quizHistoryModel.js
monthlyStats: [
  {
    month: { type: Number, required: true }, // 0-11
    year: { type: Number, required: true },
    bestScore: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
];
```

#### Add Monthly Reset Tracking:

```javascript
lastMonthlyReset: {
  month: { type: Number },
  year: { type: Number },
  date: { type: Date }
}
```

### 2. API Endpoint Updates

#### Update `getQuizStats` function in dqController.js:

```javascript
const getQuizStats = async (req, res) => {
  const { timeframe, subject, viewType } = req.query;

  if (viewType === "monthly") {
    // Check if monthly reset is needed
    await checkAndResetMonthlyStats(req.user._id);

    // Return current month stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter stats for current month only
    // ... implementation
  } else {
    // Return all-time stats (existing logic)
    // ... existing implementation
  }
};
```

#### Add Monthly Reset Function:

```javascript
const checkAndResetMonthlyStats = async (userId) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const user = await User.findById(userId);

  // Check if it's a new month since last reset
  if (
    !user.lastMonthlyReset ||
    user.lastMonthlyReset.month !== currentMonth ||
    user.lastMonthlyReset.year !== currentYear
  ) {
    // Reset monthly stats for all subjects
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          monthlyStats: [],
          lastMonthlyReset: {
            month: currentMonth,
            year: currentYear,
            date: new Date(),
          },
        },
      }
    );
  }
};
```

### 3. Quiz Submission Updates

#### Update quiz submission to track monthly stats:

```javascript
// In the quiz submission handler
const updateMonthlyStats = async (
  userId,
  subject,
  score,
  totalQuestions,
  correctAnswers
) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  await User.updateOne(
    {
      _id: userId,
      "monthlyStats.subject": subject,
      "monthlyStats.month": currentMonth,
      "monthlyStats.year": currentYear,
    },
    {
      $inc: {
        "monthlyStats.$.totalQuizzes": 1,
        "monthlyStats.$.totalCorrect": correctAnswers,
        "monthlyStats.$.totalQuestions": totalQuestions,
      },
      $max: {
        "monthlyStats.$.bestScore": score,
      },
      $set: {
        "monthlyStats.$.avgScore": {
          /* calculate new average */
        },
      },
    },
    { upsert: true }
  );
};
```

### 4. Scheduled Task (Optional)

#### Add a cron job to reset monthly stats:

```javascript
// Using node-cron
const cron = require("node-cron");

// Run at 00:01 on the 1st of every month
cron.schedule("1 0 1 * *", async () => {
  console.log("Starting monthly stats reset...");

  // Reset all users' monthly stats
  await User.updateMany(
    {},
    {
      $set: {
        monthlyStats: [],
        lastMonthlyReset: {
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
          date: new Date(),
        },
      },
    }
  );

  console.log("Monthly stats reset completed");
});
```

## Implementation Steps

1. **Update Database Models**: Add monthly stats fields to user schema
2. **Update API Endpoints**: Modify `getQuizStats` to handle `viewType` parameter
3. **Add Reset Logic**: Implement monthly reset checking function
4. **Update Quiz Submission**: Track monthly stats when quizzes are submitted
5. **Add Cron Job** (Optional): Automated monthly reset at midnight on 1st of each month
6. **Test the Integration**: Ensure frontend and backend work together

## Testing Scenarios

1. **New Month Transition**: Test behavior when month changes
2. **Empty Monthly Data**: Test display when no quizzes taken in current month
3. **Switch Between Views**: Test toggling between monthly and all-time views
4. **Multiple Subjects**: Test monthly tracking across different subjects
5. **Progress Bars**: Verify monthly progress bars work correctly

## Benefits

- **Monthly Goals**: Users can set and track monthly learning goals
- **Fresh Start**: Each month provides a clean slate for improvement
- **Motivation**: Regular reset cycles encourage consistent learning
- **Progress Tracking**: Clear view of monthly vs lifetime progress
- **Gamification**: Monthly challenges and achievements possible
