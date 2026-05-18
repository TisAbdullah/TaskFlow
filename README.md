# TaskFlow - Professional Task Management System

A full-stack task management system inspired by Trello, Notion, Asana, and Monday.com.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT (jsonwebtoken) + bcrypt |

## 📁 Project Structure

```
mmm/
├── database/
│   └── schema.sql          # MySQL database schema
├── backend/
│   ├── server.js            # Express entry point
│   ├── seed.js              # Sample data seeder
│   ├── config/db.js         # MySQL connection pool
│   ├── middleware/           # Auth & validation middleware
│   ├── models/              # Database models (7 files)
│   ├── controllers/         # Business logic (7 files)
│   └── routes/              # API route handlers (7 files)
├── frontend/
│   ├── index.html           # Login/Signup page
│   ├── dashboard.html       # Main dashboard
│   ├── tasks.html           # Kanban task board
│   ├── calendar.html        # Calendar view
│   ├── team.html            # Team management
│   ├── meetings.html        # Meetings module
│   ├── notes.html           # Notes module
│   ├── profile.html         # User profile
│   ├── css/                 # Stylesheets (8 files)
│   └── js/                  # JavaScript modules (12 files)
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher) - [Download](https://nodejs.org)
- **MySQL** (v8 or higher) - [Download](https://dev.mysql.com/downloads/)

### Step 1: Setup MySQL Database

1. Open MySQL command line or MySQL Workbench
2. Run the schema file:

```sql
source C:/Users/huzai/OneDrive/Desktop/mmm/database/schema.sql;
```

Or copy-paste the contents of `database/schema.sql` into your MySQL client.

### Step 2: Configure Environment

Edit `backend/.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taskflow
JWT_SECRET=taskflow_super_secret_key_2024
PORT=3000
```

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

### Step 4: Seed Sample Data (Optional)

```bash
npm run seed
```

This creates sample users, tasks, teams, meetings, and notes.
Default login: `admin@taskflow.com` / `password123`

### Step 5: Start the Server

```bash
npm start
```

Open your browser at: **http://localhost:3000**

## 🔑 How Authentication Works

1. User signs up → password is hashed with **bcrypt** (10 salt rounds)
2. User logs in → password is verified against hash → **JWT token** is generated (expires in 7 days)
3. Token is stored in **localStorage** on the frontend
4. Every API request includes `Authorization: Bearer <token>` header
5. Backend middleware verifies the token before processing requests
6. Logout removes the token from localStorage

## 🗃️ Database Relationships

```
users ─┬─── tasks (one-to-many: user creates tasks)
       ├─── notes (one-to-many: user creates notes)
       ├─── meetings (one-to-many: user schedules meetings)
       ├─── notifications (one-to-many)
       ├─── activities (one-to-many: activity log)
       └──┬ team_members (many-to-many through junction table)
          └─ teams
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/profile` | Get profile |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/tasks` | Get tasks (with filters) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/status` | Update status |
| GET | `/api/tasks/export/csv` | Export to CSV |
| GET | `/api/teams` | Get teams |
| POST | `/api/teams` | Create team |
| GET | `/api/meetings` | Get meetings |
| POST | `/api/meetings` | Create meeting |
| GET | `/api/notes` | Get notes |
| POST | `/api/notes` | Create note |
| PATCH | `/api/notes/:id/pin` | Toggle pin |
| GET | `/api/dashboard/stats` | Dashboard data |
| GET | `/api/notifications` | Get notifications |

## ✨ Features

- 🎨 **Dark/Light Mode** with smooth transitions
- 📊 **Dashboard** with animated counters and charts
- 📋 **Kanban Board** with drag-and-drop
- 📅 **Calendar** with tasks and meetings overlay
- 👥 **Team Management** with role-based access
- 📝 **Notes** with pin functionality
- 🔔 **Notifications** system
- 📱 **Responsive** design (mobile + desktop)
- 📥 **Export** tasks to CSV
- 🔍 **Search** and filter tasks
- ⏰ **Real-time clock** on dashboard

## 📄 License

MIT - Built for educational purposes.
