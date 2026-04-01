# Quiz Time Boundaries Walkthrough

I have successfully implemented the ability for administrators to set strict Start and End time bounds on quizzes. Here's a breakdown of how the feature works and what has been deployed:

## 1. Creating a Quiz (Admin View)
When creating a new quiz from the Admin Dashboard, there is a new **"Enable Specific Date & Time Access Window"** option. 
* By default, this is unchecked, ensuring the quiz remains open indefinitely ("Free Hand").
* When checked, two input fields (`Start Time` and `End Time`) seamlessly appear.
* **Validation:** The system prevents the admin from setting an `End Time` that occurs before the `Start Time`.

> [!TIP]
> The time selections rely on your computer's local timezone. The backend stores them uniformly in UTC to ensure no timezone discrepancies exist if an admin and student are in different regions.

## 2. Student Dashboard
The student dashboard has been significantly upgraded to visualize these time constraints dynamically.

* **Upcoming:** If a student views a time-bound quiz before the `startTime` has arrived, the card is tinted warning yellow. A `Lock` icon indicates it is upcoming, and the `Start Quiz` button is disabled, showing exactly when it will open.
* **Active:** If the time window is currently open, the quiz behaves normally. The student can now also see a `Due` label pointing out exactly when it will expire.
* **Expired:** If the `endTime` has passed, the card is tinted red. An `Expired` badge is displayed, and the start button is locked, stating the quiz is closed.

## 3. Server-Side Security Validation
Even if a tech-savvy student attempts to bypass the UI locked buttons by manually entering the quiz URL (e.g., `/student/quiz/:id`), the backend API stops them in their tracks.
* `GET /api/quizzes/:id`: The Node/Express server actively verifies if the requesting user is a student. If the quiz has a time window, the server checks the actual current server time. If they are out of bounds, the server returns a `403 Forbidden` error, and the UI immediately kicks the student back to the dashboard with an alert.
* `POST /api/results`: When submitting results, the backend performs another final check to ensure the quiz hasn't abruptly expired over their allotted timer.

## Code Modified
- `backend/models/Quiz.js` (Schema Updates)
- `backend/routes/quizzes.js` (Creation and retrieval security logic)
- `backend/routes/results.js` (Result submission validation)
- `frontend/src/pages/admin/CreateQuiz.jsx` (New UI components)
- `frontend/src/pages/student/StudentDashboard.jsx` (Status badges and conditional rendering)
- `frontend/src/pages/student/TakeQuiz.jsx` (URL bypass prevention)
