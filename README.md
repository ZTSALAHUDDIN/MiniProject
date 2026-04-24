<h1 align="center">📚 Smart Revision Scheduler</h1>

<p align="center">
  An intelligent, rule-based study planner that dynamically generates and adapts personalized study schedules.
</p>

<hr/>

<h2>🚀 Overview</h2>

<p>
Smart Revision Scheduler is a full-stack web application designed to help students efficiently plan, manage, and track their study schedules.
</p>

<p>
Unlike traditional static timetable applications, this system behaves like an <b>adaptive assistant</b> that:
</p>

<ul>
  <li>Analyzes user routine (sleep, college, meals)</li>
  <li>Schedules tasks only in available time slots</li>
  <li>Dynamically updates based on user performance</li>
</ul>

<hr/>

<h2>✨ Features</h2>

<h3>🧠 Rule-Based Intelligent Scheduling</h3>
<ul>
  <li>Generates realistic and achievable timetables</li>
  <li>Avoids conflicts with daily routine</li>
  <li>Limits workload (3–5 sessions per day)</li>
</ul>

<h3>🔁 Adaptive Scheduling</h3>
<ul>
  <li>Missed tasks are automatically rescheduled</li>
  <li>Difficult topics receive additional sessions</li>
  <li>Easy tasks reduce future workload</li>
  <li>Overloaded schedules are balanced intelligently</li>
</ul>

<h3>➕ Dynamic Task Management</h3>
<ul>
  <li>Users can add tasks manually</li>
  <li>Tasks are automatically placed in nearest free slot</li>
  <li>Lower priority tasks are shifted intelligently</li>
</ul>

<h3>🔁 Spaced Revision System</h3>
<ul>
  <li>Day 1 → Study</li>
  <li>Day 2 → Revise</li>
  <li>Day 5 → Revise</li>
  <li>Day 10 → Revise</li>
</ul>

<h3>📊 Performance Tracking</h3>
<ul>
  <li>Track completed, missed, and difficult tasks</li>
  <li>Monitor study duration</li>
  <li>Data stored dynamically using Firebase</li>
</ul>

<h3>📈 Analytics Dashboard</h3>
<ul>
  <li>Bar chart → tasks completed</li>
  <li>Line chart → study hours trend</li>
  <li>Pie chart → completion ratio</li>
</ul>

<h3>🎮 Gamification</h3>
<ul>
  <li>Earn gems for task completion</li>
  <li>Maintain streaks</li>
  <li>Unlock badges and achievements</li>
</ul>

<h3>⏱️ Time Awareness</h3>
<ul>
  <li>Dashboard clock to emphasize time management</li>
</ul>

<hr/>

<h2>🔐 Authentication & Database</h2>

<ul>
  <li>Supabase Authentication (Email/Password)</li>
  <li>Supabase for real-time storage</li>
  <li>User-specific data handling</li>
</ul>

<hr/>

<h2>🛠️ Tech Stack</h2>

<p><b>Frontend:</b></p>
<ul>
  <li>React.js (Vite)</li>
  <li>Tailwind CSS</li>
  <li>ShadCN UI</li>
</ul>

<p><b>Backend & Database:</b></p>
<ul>
  <li>Supabase Authentication</li>
</ul>

<hr/>

<h2>⚙️ Setup Instructions</h2>

<h3>Clone the Repository</h3>

<pre>
git clone https://github.com/ZTSALAHUDDIN/MiniProject
cd MP
</pre>

<h3>Install Dependencies</h3>

<pre>
npm install
</pre>

<h3>Run the Application</h3>

<pre>
npm run dev
</pre>

<p>Open in browser:</p>

<pre>
http://localhost:8080
</pre>


<hr/>

<h2>⚠️ Important Notes</h2>

<ul>
  <li>No machine learning is used (rule-based system)</li>
  <li>No static data — everything is dynamic via Supabase</li>
  <li>Ensure internet connection for Supabase services</li>
</ul>

<hr/>

<h2>🎯 Future Enhancements</h2>

<ul>
  <li>Smart notifications and reminders</li>
  <li>AI-based recommendations (future upgrade)</li>
  <li>Mobile application version</li>
</ul>

<hr/>

<h2>👩‍💻 Author</h2>

<p><b>Akshay Malkar</b></p>
<p><b>Medhaj Dixit</b></p>
<p><b>Saksham Shukla</b></p>
<p><b>Zoya Salahuddin</b></p>

<hr/>

<h2 align="center">🌟 Final Note</h2>

<p align="center">
  This project demonstrates real-world system design, adaptive scheduling, and dynamic data handling.
</p>

<p align="center">
  <b>"Plan smart. Study better. Achieve more." 🚀</b>
