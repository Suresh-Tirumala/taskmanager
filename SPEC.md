# Team Task Manager - Specification Document

## 1. Project Overview

### Project Name
Team Task Manager

### Type
Full-stack Web Application

### Core Functionality
A comprehensive task management system with role-based access control, enabling teams to collaborate on projects with proper task assignment, tracking, and analytics.

### Target Users
- Team Managers/Admins who need to oversee projects and team members
- Team Members who need to manage their assigned tasks

---

## 2. Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **State Management**: Context API
- **Notifications**: react-hot-toast
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

### Architecture
- MVC (Model-View-Controller) pattern
- RESTful API design

---

## 3. UI/UX Specification

### Color Palette
```css
--primary: #4F46E5;        /* Indigo-600 - Main brand color */
--primary-dark: #4338CA;   /* Indigo-700 - Hover states */
--primary-light: #EEF2FF;  /* Indigo-50 - Backgrounds */
--secondary: #10B981;      /* Emerald-500 - Success states */
--danger: #EF4444;         /* Red-500 - Error/delete states */
--warning: #F59E0B;        /* Amber-500 - Warning states */
--dark: #1F2937;           /* Gray-800 - Primary text */
--dark-secondary: #374151; /* Gray-700 - Secondary text */
--gray-100: #F3F4F6;       /* Light backgrounds */
--gray-200: #E5E7EB;       /* Borders */
--gray-300: #D1D5DB;       /* Disabled states */
--white: #FFFFFF;
--dark-bg: #111827;        /* Dark mode background */
--dark-card: #1F2937;      /* Dark mode card */
```

### Typography
- **Font Family**: Inter (primary), system-ui (fallback)
- **Headings**:
  - H1: 2rem (32px), font-weight: 700
  - H2: 1.5rem (24px), font-weight: 600
  - H3: 1.25rem (20px), font-weight: 600
  - H4: 1rem (16px), font-weight: 600
- **Body**: 0.875rem (14px), font-weight: 400
- **Small**: 0.75rem (12px), font-weight: 400

### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Container max-width: 1280px
- Sidebar width: 256px
- Navbar height: 64px

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Layout Structure

#### Main Layout (Authenticated)
```
┌─────────────────────────────────────────────┐
│  Navbar (64px height)                       │
├────────────┬────────────────────────────────┤
│            │                                │
│  Sidebar   │    Main Content Area           │
│  (256px)   │    (flex-1)                    │
│            │                                │
│  - Logo    │    - Page Header               │
│  - Nav     │    - Page Content              │
│  - User    │                                │
│            │                                │
└────────────┴────────────────────────────────┘
```

#### Auth Pages (Unauthenticated)
```
┌─────────────────────────────────────────────┐
│                                             │
│         Centered Card (max 400px)           │
│         - Logo                              │
│         - Form                              │
│         - Link to alternate page           │
│                                             │
└─────────────────────────────────────────────┘
```

### Component Specifications

#### Buttons
- **Primary**: bg-primary, text-white, px-4 py-2, rounded-lg
- **Secondary**: bg-gray-100, text-dark, px-4 py-2, rounded-lg
- **Danger**: bg-danger, text-white, px-4 py-2, rounded-lg
- **States**: hover (darken 10%), active (scale 0.98), disabled (opacity 50%)
- **Sizes**: sm (32px), md (40px), lg (48px)

#### Cards
- Background: white
- Border: 1px solid gray-200
- Border-radius: 12px
- Padding: 24px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)

#### Form Inputs
- Height: 40px
- Border: 1px solid gray-200
- Border-radius: 8px
- Padding: 0 12px
- Focus: ring-2 ring-primary

#### Tables
- Header: bg-gray-50, font-weight: 600
- Rows: hover:bg-gray-50
- Border: 1px solid gray-200

#### Modals
- Overlay: bg-black/50
- Card: max-width 500px, centered
- Animation: fade in + scale

### Status Colors
- **Todo**: bg-blue-100 text-blue-800
- **In Progress**: bg-yellow-100 text-yellow-800
- **Completed**: bg-green-100 text-green-800

### Priority Colors
- **Low**: bg-gray-100 text-gray-700
- **Medium**: bg-yellow-100 text-yellow-800
- **High**: bg-red-100 text-red-800

### Animations
- Page transitions: fade 200ms
- Button hover: 150ms ease
- Modal: 200ms ease-out
- Sidebar collapse: 300ms ease

---

## 4. Functionality Specification

### 4.1 Authentication System

#### User Registration
- Fields: name, email, password, confirmPassword, role
- Validation:
  - Name: required, min 2 chars
  - Email: required, valid email format, unique
  - Password: required, min 6 chars
  - Role: required, enum ["admin", "member"]
- On success: redirect to login with success message

#### User Login
- Fields: email, password
- Validation: email and password required
- On success:
  - Store JWT token in localStorage
  - Store user data in Context
  - Redirect to dashboard
- On error: display error message

#### Logout
- Clear localStorage token
- Clear Context user state
- Redirect to login page

#### JWT Authentication
- Token expiry: 7 days
- Token stored in localStorage
- Auto-attach to all API requests via Axios interceptor

### 4.2 Project Management

#### Create Project (Admin only)
- Fields: title, description, members (array of user IDs)
- Validation: title required, unique title
- Auto-set: createdBy = current user ID, createdAt = now

#### List Projects
- Admin: see all projects
- Member: see only projects where they are a member

#### Get Project Details
- Return project with populated members and tasks

#### Update Project (Admin only)
- Fields: title, description, members
- Can add/remove members

#### Delete Project (Admin only)
- Cascade delete all associated tasks
- Return confirmation

### 4.3 Task Management

#### Create Task
- Fields: title, description, assignedTo, priority, dueDate, project
- Validation: title required, project required
- Default status: "todo"

#### List Tasks
- Filter by: project, status, priority, assignedTo
- Search by: title, description
- Sort by: createdAt, dueDate, priority

#### Update Task
- Fields: any task field
- Validation: if assignedTo changed, must be project member
- Status transitions: any to any

#### Delete Task
- Only creator or admin can delete

#### Task Fields
- title: string, required
- description: string
- assignedTo: ObjectId (User ref)
- priority: enum ["low", "medium", "high"]
- status: enum ["todo", "in-progress", "completed"]
- dueDate: Date
- project: ObjectId (Project ref), required
- createdBy: ObjectId (User ref)
- createdAt: Date
- updatedAt: Date

### 4.4 Dashboard

#### Statistics Cards
- Total Projects (for admin) / Assigned Projects (for member)
- Total Tasks
- Completed Tasks
- Pending Tasks (todo + in-progress)
- Overdue Tasks

#### Charts
- Tasks by status (pie/donut chart)
- Tasks by priority (bar chart)
- Tasks completion trend (line chart - last 7 days)

#### Recent Activity
- Last 5 tasks created/updated
- Show: task title, user, action, timestamp

#### My Tasks
- Tasks assigned to current user
- Quick status update buttons

### 4.5 Role-Based Access Control

#### Admin Capabilities
- Create/Edit/Delete projects
- Add/Remove project members
- Create/Edit/Delete any task
- View all projects and tasks
- Access all dashboard data

#### Member Capabilities
- View assigned projects only
- Create tasks in assigned projects
- Edit/Delete own tasks only
- Update own task status
- View own dashboard stats

### 4.6 API Endpoints

#### Auth Routes
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

#### Project Routes
- GET /api/projects - List projects
- POST /api/projects - Create project (admin)
- GET /api/projects/:id - Get project details
- PUT /api/projects/:id - Update project (admin)
- DELETE /api/projects/:id - Delete project (admin)

#### Task Routes
- GET /api/tasks - List tasks (filtered)
- POST /api/tasks - Create task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

---

## 5. Database Schema

### User Model
```javascript
{
  name: String (required, min 2),
  email: String (required, unique, valid email),
  password: String (required, hashed),
  role: String (enum: ["admin", "member"], default: "member"),
  avatar: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  title: String (required, unique),
  description: String,
  members: [{ type: ObjectId, ref: "User" }],
  createdBy: { type: ObjectId, ref: "User" },
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  title: String (required),
  description: String,
  assignedTo: { type: ObjectId, ref: "User" },
  priority: String (enum: ["low", "medium", "high"], default: "medium"),
  status: String (enum: ["todo", "in-progress", "completed"], default: "todo"),
  dueDate: Date,
  project: { type: ObjectId, ref: "Project", required },
  createdBy: { type: ObjectId, ref: "User" },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 6. File Structure

### Backend
```
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validateMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   └── taskRoutes.js
│   ├── utils/
│   │   └── asyncHandler.js
│   ├── app.js
│   └── server.js
├── package.json
└── .env
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   ├── UI/
│   │   └── Charts/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   ├── pages/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Projects/
│   │   └── Tasks/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env
```

---

## 7. Acceptance Criteria

### Authentication
- [ ] User can register with valid credentials
- [ ] User can login and receive JWT token
- [ ] Protected routes redirect to login if not authenticated
- [ ] Logout clears session and redirects

### Projects
- [ ] Admin can create new project
- [ ] Admin can edit project details
- [ ] Admin can delete project (cascades to tasks)
- [ ] Admin can add/remove members
- [ ] Members can only view assigned projects

### Tasks
- [ ] Users can create tasks in assigned projects
- [ ] Users can edit their own tasks
- [ ] Users can change task status
- [ ] Users can filter tasks by various criteria
- [ ] Overdue tasks are highlighted

### Dashboard
- [ ] Stats display correct counts
- [ ] Charts render with real data
- [ ] Recent activity shows latest actions
- [ ] My tasks section shows assigned tasks

### RBAC
- [ ] Admin sees all features
- [ ] Member sees restricted features
- [ ] Unauthorized actions return 403
- [ ] UI hides/disables unauthorized actions

### UI/UX
- [ ] Responsive on all screen sizes
- [ ] Loading states show during API calls
- [ ] Error messages display clearly
- [ ] Empty states show when no data
- [ ] Toast notifications for actions

---

## 8. Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=taskmanager
DB_USER=root
DB_PASSWORD=yourpassword
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 9. Deployment

### Backend (Render/Railway)
- Node.js runtime
- Start command: node src/server.js
- Environment variables configured in dashboard

### Frontend (Vercel)
- Framework: Vite
- Build command: npm run build
- Output directory: dist
- Environment variables configured in settings