# Backend Structure

Current status: backend code exists in the repository, but the active mobile prototype is local-first and does not require the backend to run.

Future backend integration should preserve the current mobile flow:

```txt
Onboarding language
  -> Login / Signup
  -> Profession questions
  -> Local dashboard UX
```

Expected backend modules for future work:

```txt
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── transactions/
│   │   ├── dashboard/
│   │   ├── rtc/
│   │   └── ai/
│   ├── middleware/
│   ├── routes/
│   ├── app.ts
│   └── server.ts
├── prisma/
└── package.json
```

When backend APIs are reconnected, replace local Zustand mutations gradually rather than changing the screen flow.
