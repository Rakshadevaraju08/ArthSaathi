arthsaathi-backend/
├── .env
├── .gitignore
├── package.json
├── server.js
├── app.js
├── prisma/
│   └── schema.prisma
└── src/
    ├── config/
    │   ├── db.js
    │   └── environment.js
    ├── middlewares/
    │   ├── auth.middleware.js
    │   ├── error.middleware.js
    │   ├── logger.middleware.js
    │   └── validate.middleware.js
    ├── utils/
    │   ├── logger.js
    │   └── apiResponse.js
    ├── routes/
    │   └── index.js
    └── modules/
        ├── auth/
        │   ├── auth.controller.js
        │   ├── auth.routes.js
        │   ├── auth.service.js
        │   └── auth.validation.js
        ├── users/
        │   ├── users.controller.js
        │   ├── users.routes.js
        │   └── users.service.js
        ├── transactions/
        │   ├── transactions.controller.js
        │   ├── transactions.routes.js
        │   └── transactions.service.js
        ├── dashboard/
        │   ├── dashboard.controller.js
        │   ├── dashboard.routes.js
        │   └── dashboard.service.js
        ├── rtc/
        │   ├── rtc.controller.js
        │   ├── rtc.routes.js
        │   └── rtc.service.js
        └── ai/
            ├── ai.controller.js
            ├── ai.routes.js
            ├── ai.service.js
            └── ai.validation.js