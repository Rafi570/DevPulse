# DEVPULSE 🚼

> Internal Tech Issue & Feature Tracker
>
> A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

---

## 🚀 Live Deployment
- **Live API URL:** [https://dev-pulse-gold.vercel.app) *(Replace with your actual deployment link if different)*

---

## ✨ Features
- **Role-Based Access Control (RBAC):** Distinct permissions for `contributor` and `maintainer` roles.
- **Secure Authentication:** Password hashing using `bcrypt` and session management via `jsonwebtoken` (JWT).
- **Issue Tracking Workflow:** Create, view, update, and delete bug reports or feature requests.
- **Advanced Filtering & Sorting:** Fetch issues with dynamic filtering by `type` and `status`, along with chronological sorting (`newest`/`oldest`).
- **Strict Business Logic Verification:** Contributors can only update their own issues and only when the issue workflow status is `open`. Maintainers have full administrative overrides.
- **High-Performance Architecture:** Native `pg` queries with custom application-level data mapping, avoiding heavy ORM overhead and SQL JOINs.

---

## 🛠️ Technology Stack
- **Runtime:** Node.js (LTS v24.x)
- **Language:** TypeScript
- **Framework:** Express.js (Modular router architecture)
- **Database:** PostgreSQL (Hosted via NeonDB/Supabase)
- **Database Driver:** Native `@neondatabase/serverless` / `pg` driver with Raw SQL queries
- **Security:** `bcrypt` (Password encryption) & `jsonwebtoken` (JWT implementation)

---

## 🗄️ Database Schema Summary

### 1. `users` Table
| Field | Data Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | `PRIMARY KEY` |
| `name` | `VARCHAR(150)` | `NOT NULL` |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` |
| `password_hash` | `TEXT` | `NOT NULL` |
| `role` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'contributor'` |
| `created_at` | `TIMESTAMP` | `NOT NULL`, `DEFAULT NOW()` |
| `updated_at` | `TIMESTAMP` | `NOT NULL`, `DEFAULT NOW()` |

### 2. `issues` Table
| Field | Data Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | `PRIMARY KEY` |
| `title` | `VARCHAR(150)` | `NOT NULL` |
| `description` | `TEXT` | `NOT NULL` |
| `type` | `VARCHAR(50)` | `CHECK (type IN ('bug', 'feature_request'))` |
| `status` | `VARCHAR(50)` | `DEFAULT 'open'`, `CHECK (status IN ('open', 'in_progress', 'resolved'))` |
| `reporter_id` | `INT` | `NOT NULL` (Validated in Application Logic) |
| `created_at` | `TIMESTAMP` | `NOT NULL`, `DEFAULT NOW()` |
| `updated_at` | `TIMESTAMP` | `NOT NULL`, `DEFAULT NOW()` |

---

## 🌐 API Endpoints Specification

### 🔹 Authentication Module
- **`POST /api/auth/signup`** - Register a new account (`contributor` / `maintainer`). *Access: Public*
- **`POST /api/auth/login`** - Authenticate user and receive a JWT token. *Access: Public*

### 🔹 Issues Module
- **`POST /api/issues`** - Create a new bug report or feature request. *Access: Authenticated*
- **`GET /api/issues`** - Retrieve all issues with sorting (`sort=newest|oldest`) and filtering (`type`, `status`). *Access: Public*
- **`GET /api/issues/:id`** - Get full details of a specific issue. *Access: Public*
- **`PATCH /api/issues/:id`** - Update issue fields. *Access: Maintainer OR Contributor (Own issue & status is 'open')*
- **`DELETE /api/issues/:id`** - Permanently remove an issue. *Access: Maintainer Only*

---

## 💻 Setup & Installation Instructions

Follow these steps to run the project locally:

### 1. Clone the Repository
```bash
git clone [https://github.com/abdulhakimarman/DEVPULSE](https://github.com/abdulhakimarman/DEVPULSE)
cd devpulse
