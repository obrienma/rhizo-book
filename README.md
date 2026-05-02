# ![](frontend/public/flavicon.svg) RhizoBook | Health Appointment Scheduler

A full-stack healthcare appointment scheduling system built with NestJS, Next.js, and TypeScript. Patients can browse providers, book appointments, and manage their schedule. Providers can view upcoming appointments and manage cancellations.

## 🚧 Status

- **Backend API** — Live at **https://api.rhizobook.cyberrhizome.ca/api** (Swagger UI)
- **Frontend** — See screeshots below.
- Both services connect to a hosted PostgreSQL database on [Neon](https://neon.tech)

## 📖 Documentation

| File | Contents |
|------|----------|
| [docs/DEV_GETTING_STARTED.md](docs/DEV_GETTING_STARTED.md) | Local development setup |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data model, module map, auth flow |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Railway + Vercel + Neon production deployment |
| [backend/README.md](backend/README.md) | Backend-specific commands and structure |
| [frontend/README.md](frontend/README.md) | Frontend-specific commands and structure |

## 🏥 Features

- **Multi-role authentication** — JWT-based login for Providers and Patients via NextAuth
- **Provider discovery** — patients browse providers by specialty with live availability
- **Appointment booking** — time-slot picker generated from provider availability schedules
- **Appointment management** — list, filter by status, and cancel with optional reason
- **Swagger / OpenAPI** — fully documented API with typed request/response schemas
- **Role-based access control** — providers and patients see only their own data
- **Landing page** — public marketing page with provider/patient CTAs

## 🚧 Roadmap

- [x] Backend API with full CRUD for appointments
- [x] JWT authentication with role-based access
- [x] Swagger / OpenAPI documentation
- [x] Frontend — patient and provider dashboards
- [x] Booking flow with availability-based time slot picker
- [x] Appointment cancellation with reason
- [x] Public landing page
- [x] New Patient, Provider Sign up
- [x] Unified branding experience for authenticated and unauthenticated users (RhizoBook)
- [x] Expanded seed data with French Canadian and multi-character sets
- [x] Unauthenticated provider search
- [ ] Location-based provider search (requires location field on ProviderProfile)
- [ ] Email notifications and reminders
- [ ] Calendar view for appointments
- [ ] Recurring availability schedules
- [ ] Timezone handling
- [ ] HIPAA compliance features

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeScript |
| Frontend | Next.js 14+, TypeScript, Tailwind CSS |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 6 |
| Auth | JWT + Passport (backend), NextAuth v4 (frontend) |
| Forms | react-hook-form + zod |
| API docs | Swagger / OpenAPI |

## 🛠️ Quick Start

See [docs/DEV_GETTING_STARTED.md](docs/DEV_GETTING_STARTED.md) for full local setup instructions.

## 📂 Project Structure

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
    │   ├── (marketing)/       # Public landing page
    │   ├── (app)/             # Authenticated routes + shared nav layout
    │   │   ├── dashboard/
    │   │   ├── appointments/
    │   │   └── providers/[id]/
    │   ├── api/auth/          # NextAuth route handler
    │   └── login/
    └── components/
```
## 🤫 Sneak Peak
<img width="1248" height="1165" alt="Screenshot 2026-02-24 005843" src="https://github.com/user-attachments/assets/b5462d91-3bfb-4e65-9a63-619a87600f63" />
<img width="727" height="1190" alt="Screenshot 2026-02-24 005928" src="https://github.com/user-attachments/assets/3ef595fe-ac0d-4c42-8015-0b16eba506e0" />
<img width="1078" height="1169" alt="Screenshot 2026-02-25 100252" src="https://github.com/user-attachments/assets/c2c4ed37-fa64-476f-9c69-e85e0f9fe532" />
<img width="1089" height="1066" alt="Screenshot 2026-02-25 100336" src="https://github.com/user-attachments/assets/ca4288ab-b5dd-42c4-b3f6-5a72b0486580" />
<img width="1063" height="1215" alt="Screenshot 2026-02-25 103528" src="https://github.com/user-attachments/assets/f7a95033-f9f3-456a-8f88-0775dd43ce1e" />

## 🤝 Contributing

This is a personal project for demonstration purposes. Contributions, suggestions, and feedback are welcome! If you find a bug or have an idea for improvement, feel free to open an issue or submit a pull request.

## 📄 License

This project is private and proprietary.

## 👩‍💻 Author

**Amanda O'Brien**

## 🙏 Acknowledgments

- NestJS team for the great framework
- Prisma for excellent ORM tooling
- Neon for serverless PostgreSQL hosting




