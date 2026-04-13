# 🎓 TeachAssist — Teacher Assistant Web Application

A production-ready, full-stack Teacher Assistant SaaS platform built with **Spring Boot** + **React** + **MySQL**.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React (Vite) + Tailwind CSS v3 + React Router + Axios + Recharts + Lucide React + React Hot Toast |
| **Backend** | Java Spring Boot 3.2 (REST APIs, Layered Architecture) |
| **Database** | MySQL 8+ |
| **Auth** | JWT (io.jsonwebtoken / jjwt 0.12.x) |
| **PDF Export** | OpenPDF |

---

## 📁 Project Structure

```
teacherassistant/
├── backend/                     # Spring Boot API
│   ├── src/main/java/com/ta/
│   │   ├── config/              # JWT, Security, CORS
│   │   ├── controller/          # REST Controllers (8)
│   │   ├── service/             # Business Logic (8)
│   │   ├── repository/          # Spring Data JPA (8)
│   │   ├── model/               # JPA Entities (8) + Enums (3)
│   │   ├── dto/                 # Data Transfer Objects (15+)
│   │   └── exception/           # Global Exception Handling
│   └── src/main/resources/
│       ├── application.properties
│       └── schema.sql
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── api/                 # Axios with JWT interceptors
│   │   ├── context/             # AuthContext + ThemeContext
│   │   ├── components/
│   │   │   ├── ui/              # Button, Card, Modal, Table, Input, Select, Badge, Skeleton, EmptyState
│   │   │   ├── layout/          # Sidebar, Navbar, DashboardLayout
│   │   │   └── shared/          # SearchBar, Pagination, ThemeToggle
│   │   ├── pages/               # Login, Register, ProfileSetup, Dashboard, Batches, Students, Attendance, Marks
│   │   └── utils/               # Helpers
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Java 17+** (JDK)
- **Maven 3.8+** (or use included wrapper)
- **Node.js 18+** & npm
- **MySQL 8+** running on localhost:3306

### 1. Database Setup
```sql
CREATE DATABASE teacher_assistant;
```
> Or let Spring Boot auto-create it (configured with `createDatabaseIfNotExist=true`).

### 2. Backend Setup
```bash
cd backend

# Update MySQL credentials in src/main/resources/application.properties
# Default: root / (empty password)

# Build & Run
./mvnw spring-boot:run
# Or on Windows:
mvnw.cmd spring-boot:run
```
Backend runs at: **http://localhost:8080**

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## 🔐 Authentication Flow

1. **Register** → Create account (name, email, password)
2. **Login** → Receive JWT token
3. **Profile Setup** → Complete onboarding (college, department, subjects)
4. **Dashboard** → Full access to all features

JWT token is stored in `localStorage` and auto-attached via Axios interceptors.

---

## 📋 API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new teacher |
| POST | `/api/auth/login` | Login, returns JWT |

### Teacher Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teachers/profile` | Get profile |
| PUT | `/api/teachers/profile` | Update profile + subjects |
| GET | `/api/teachers/subjects` | List subjects |
| POST | `/api/teachers/subjects` | Add subject |
| DELETE | `/api/teachers/subjects/{id}` | Delete subject |

### Batches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/batches` | List batches |
| GET | `/api/batches/{id}` | Get batch |
| POST | `/api/batches` | Create batch |
| PUT | `/api/batches/{id}` | Update batch |
| DELETE | `/api/batches/{id}` | Delete batch |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students?batchId=&search=&page=&size=` | List with filters |
| GET | `/api/students/batch/{batchId}` | List by batch |
| POST | `/api/students` | Add student |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Delete student |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/sessions` | Create session + mark |
| PUT | `/api/attendance/sessions/{id}` | Update session |
| GET | `/api/attendance/sessions/{id}` | Get session detail |
| GET | `/api/attendance/sessions?batchId=&subjectId=&startDate=&endDate=` | Filter sessions |

### Marks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/marks` | Add marks (bulk) |
| PUT | `/api/marks/{id}` | Update marks |
| DELETE | `/api/marks/{id}` | Delete marks |
| GET | `/api/marks?subjectId=&examType=&examName=` | Filter marks |

### Dashboard & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | All dashboard data |
| GET | `/api/reports/attendance?batchId=&subjectId=` | Attendance PDF |
| GET | `/api/reports/marks?batchId=&subjectId=&examType=` | Marks PDF |

### Error Response Format
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "status": 404,
  "message": "Resource not found",
  "path": "/api/batches/999"
}
```

---

## 🗄️ Database Schema

8 tables with proper foreign keys, indexes, and soft-delete:

- **teacher** — Auth + profile (college, department, role)
- **subject** — Unique subject_code per teacher
- **batch** — Class groups
- **batch_subject** — Many-to-many mapping
- **student** — Name, roll number, email, batch
- **attendance_session** — Date, hours, topic, subject, batch
- **attendance_record** — Per-student status (PRESENT/ABSENT)
- **marks** — Per-student exam marks with type

---

## 🎨 UI Features

- ✅ Modern SaaS dashboard (Notion/Stripe inspired)
- ✅ Collapsible sidebar + top navbar with profile dropdown
- ✅ Dark mode toggle 🌙
- ✅ Glass-morphism cards with soft shadows
- ✅ Indigo/Purple gradient design system
- ✅ Smooth animations & micro-interactions
- ✅ Modal forms for CRUD operations
- ✅ Toast notifications (react-hot-toast)
- ✅ Loading skeletons & empty states
- ✅ Fully responsive (mobile/tablet/desktop)
- ✅ Green/Red attendance toggles
- ✅ Progress bars for marks
- ✅ Ranked performers with trophy icons
- ✅ Charts (Recharts) — attendance trends + marks distribution

---

## 🏗️ Architecture & Design Decisions

1. **Layered Backend** — Controller → Service → Repository for clean separation of concerns
2. **DTO Pattern** — Never expose entities directly; request/response DTOs for all endpoints
3. **Soft Delete** — `is_deleted` flag instead of hard deletes for data recovery
4. **JWT Stateless Auth** — No server-side sessions; token contains userId, email, role
5. **Role-Ready** — TEACHER/ADMIN enum prepared for future multi-role support
6. **Global Exception Handling** — Consistent error response format across all endpoints
7. **Component-Based UI** — Reusable components (Button, Card, Modal, Table, etc.)
8. **Context API** — AuthContext and ThemeContext for global state
9. **Axios Interceptors** — Auto-attach JWT, auto-redirect on 401

---

## 📄 License

MIT
