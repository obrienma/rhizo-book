# Health Appointment Scheduler

A full-stack healthcare appointment scheduling system built with NestJS, Next.js, and TypeScript. Patients can browse providers, book appointments, and manage their schedule. Providers can view upcoming appointments and manage cancellations.

## Status

The backend API is live at **https://health-scheduler-ts.onrender.com/api** (Swagger UI).
The frontend is deployed and functional. Both connect to a hosted PostgreSQL database on [Neon](https://neon.tech).

## Features

- **Multi-role authentication** — JWT-based login for Providers and Patients via NextAuth
- **Provider discovery** — patients browse providers by specialty with live availability
- **Appointment booking** — time-slot picker generated from provider availability schedules
- **Appointment management** — list, filter by status, and cancel with optional reason
- **Swagger / OpenAPI** — fully documented API with typed request/response schemas
- **Role-based access control** — providers and patients see only their own data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeScript |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 6 |
| Auth | JWT + Passport (backend), NextAuth (frontend) |
| API docs | Swagger / OpenAPI |

## Quick Start

See [docs/DEV_GETTING_STARTED.md](docs/DEV_GETTING_STARTED.md) for full local setup instructions.

```bash
# Backend
cd backend && npm install && npm run start:dev   # http://localhost:3001

# Frontend (separate terminal)
cd frontend && npm install && npm run dev         # http://localhost:3000
```

## Seed Credentials

After running `npx prisma db seed` (or against the live DB):

| Role | Email | Password |
|------|-------|----------|
| Provider | sarah.johnson@clinic.com | password123 |
| Provider | mike.chen@clinic.com | password123 |
| Provider | priya.patel@clinic.com | password123 |
| Patient | alice.smith@email.com | password123 |
| Patient | james.nguyen@email.com | password123 |
| Patient | emma.wilson@email.com | password123 |

## Documentation

| File | Contents |
|------|----------|
| [docs/DEV_GETTING_STARTED.md](docs/DEV_GETTING_STARTED.md) | Local development setup |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data model, module map, auth flow |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Render + Neon production deployment |
| [backend/README.md](backend/README.md) | Backend-specific commands and structure |
| [frontend/README.md](frontend/README.md) | Frontend-specific commands and structure |

## Project Structure

```
health-scheduler-ts/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEV_GETTING_STARTED.md
│   └── DEPLOYMENT.md
├── backend/                   # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── providers/
│       ├── appointments/
│       └── main.ts
└── frontend/                  # Next.js app
    ├── app/
    │   ├── dashboard/
    │   ├── appointments/
    │   ├── providers/
    │   └── login/
    └── components/
```

## Roadmap

- [x] Backend API with full CRUD for appointments
- [x] JWT authentication with role-based access
- [x] Swagger / OpenAPI documentation
- [x] Frontend — patient and provider dashboards
- [x] Booking flow with availability-based time slot picker
- [x] Appointment cancellation with reason
- [ ] Email notifications and reminders
- [ ] Calendar view for appointments
- [ ] Recurring availability schedules
- [ ] Timezone handling
- [ ] HIPAA compliance features

## Author

**Amanda O'Brien**

## License

Private and proprietary.


Core backend API endpoints are live and available [here](https://health-scheduler-ts.onrender.com/api). The frontend user interface is under development and will be released soon. Stay tuned for updates and new features!

Known issues and planned improvements are tracked in the project's [GitHub Issues](https://github.com/obrienma/health-scheduler-ts/issues). Feel free to check there for current todos or to suggest new features.

## 🏥 Features

- **Multi-role Authentication**: Secure JWT-based auth for Providers and Patients
- **Provider Management**: Healthcare providers can manage their profiles and availability
- **Appointment Scheduling**: Patients can book, view, and manage appointments
- **RESTful API**: Clean, documented API endpoints with Swagger/OpenAPI
- **Database Management**: PostgreSQL with Prisma ORM for type-safe database access
- **Role-Based Access Control**: Separate permissions for providers and patients

## 🚀 Tech Stack

- **Backend Framework**: [NestJS](https://nestjs.com/) 10.x
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 6.x
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **Password Hashing**: bcrypt

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database (or Neon account)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:obrienma/health-scheduler-ts.git
   cd health-scheduler-ts
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRATION=7d
   HOST=localhost
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the database** (optional)
   ```bash
   npx prisma db seed
   ```

## 🏃 Running the Application

### Development Mode
```bash
cd backend
npm run start:dev

cd ../frontend
npm run dev
```

The API will be available at `http://localhost:3001`

### Production Mode
```bash
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the application is running, access the interactive Swagger documentation at:

**http://localhost:3001/api**

### Quick API Examples

#### Register a new user
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "name": "John Patient",
    "password": "password123",
    "roleId": 2
  }'
```

#### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "password123"
  }'
```

#### Get all providers (requires JWT token)
```bash
curl -X GET http://localhost:3001/providers \
  -H "Authorization: Bearer <your_jwt_token>"
```

## 🗂️ Project Structure

```
health-scheduler-ts/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seed.ts           # Database seeding
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   ├── users/            # User management
│   │   ├── providers/        # Provider management
│   │   ├── appointments/     # Appointment scheduling
│   │   ├── prisma/           # Prisma service
│   │   └── main.ts           # Application entry point
│   ├── .env                  # Environment variables
│   └── package.json
├── frontend/                 # (Coming soon)
└── README.md
```

## 🔑 User Roles

- **Role ID 1**: Provider (Healthcare professional)
- **Role ID 2**: Patient

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Database Schema

Key entities:
- **User**: User accounts with authentication
- **Role**: User roles (Provider/Patient)
- **Provider**: Healthcare provider profiles
- **Patient**: Patient profiles
- **Appointment**: Appointment bookings
- **TimeSlot**: Provider availability
- **Notification**: System notifications

## 🚧 Roadmap

- [ ] Frontend application (React + TypeScript)
- [ ] Calendar UI for appointment visualization
- [ ] Email notifications and reminders
- [ ] Recurring availability schedules
- [ ] Appointment cancellation/rescheduling
- [ ] Patient history and medical records
- [ ] Timezone handling
- [ ] HIPAA compliance features
- [ ] Payment integration
- [ ] SMS notifications

## 🤝 Contributing

This is a personal project for demonstration and learning purposes. Contributions, suggestions, and feedback are welcome! If you find a bug or have an idea for improvement, feel free to open an issue or submit a pull request.

## 📄 License

This project is private and proprietary.

## 👤 Author

**Amanda O'Brien**

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Prisma for excellent ORM tooling
- Neon for serverless PostgreSQL hosting
