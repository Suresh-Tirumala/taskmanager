# Team Task Manager

A production-ready full-stack task management application with role-based access control.

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS
- React Router DOM
- Axios
- Context API
- Recharts (Charts)
- Lucide React (Icons)
- react-hot-toast (Notifications)

### Backend
- Node.js
- Express.js
- SQLite with Sequelize ORM
- JWT Authentication
- bcryptjs (Password hashing)

## Features

### Authentication System
- User signup/login with JWT
- Password hashing with bcrypt
- Role selection (Admin/Member)
- Protected routes

### Project Management
- Create, edit, delete projects (Admin only)
- Add/remove team members
- View assigned projects (Members)

### Task Management
- Create, edit, delete tasks
- Assign to team members
- Status tracking (Todo, In Progress, Completed)
- Priority levels (Low, Medium, High)
- Due date with overdue detection
- Search and filter

### Dashboard
- Total projects, tasks, completed, pending, overdue stats
- Tasks by status chart (Pie)
- Tasks by priority chart (Bar)
- Recent activity
- My tasks overview

### Role-Based Access Control
- **Admin**: Full access to all features
- **Member**: Limited to assigned projects/tasks

## Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Helper functions
│   │   ├── app.js        # Express app
│   │   └── server.js     # Entry point
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/    # UI components
    │   ├── context/      # Auth context
    │   ├── pages/        # Page components
    │   ├── services/     # API service
    │   ├── App.jsx       # Main app
    │   └── main.jsx      # Entry point
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project (Admin)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/dashboard` - Get dashboard stats

## Setup Instructions

### Prerequisites
- Node.js (v18+)

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

**Note:** The application uses SQLite database which automatically creates `database.sqlite` file.

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Sample Test Data

### Create Admin User
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Create Member User
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "member"
}
```

### Create Sample Project
```json
{
  "title": "Website Redesign",
  "description": "Redesign company website with new branding",
  "members": [1]
}
```

### Create Sample Task
```json
{
  "title": "Design Homepage",
  "description": "Create new homepage design mockups",
  "project": 1,
  "priority": "high",
  "status": "todo",
  "dueDate": "2024-12-31"
}
```

## Environment Variables

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| JWT_SECRET | JWT signing key | random-string |
| NODE_ENV | Environment | development/production |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

## License

MIT License