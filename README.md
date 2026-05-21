# IPT 2026 Angular Frontend

Angular 21 Auth Boilerplate — Email Sign Up with Verification, Authentication & Forgot Password.

## Features
- Email sign up & verification
- JWT authentication with refresh tokens (auto-renews 1 min before expiry)
- Role-based access (Admin / User)
- Forgot password & reset password
- Profile view & update
- Admin panel — manage all accounts
- **Fake backend** (enabled in dev, disabled in production)

## Quick Start (Local)

```bash
npm install
npm start
# → http://localhost:4200
```

The app runs with a **fake backend** by default — no real API needed.  
After registering, a "verification email" link appears on-screen — click it to verify.  
The **first account** created becomes Admin.

---

## Project Structure

```
src/app/
├── _components/        alert.component (global alerts)
├── _helpers/           app.initializer, auth.guard, jwt.interceptor,
│                       error.interceptor, fake-backend, must-match.validator
├── _models/            account, alert, role
├── _services/          account.service, alert.service
├── account/            login, register, verify-email, forgot-password, reset-password
├── admin/              overview, subnav
│   └── accounts/       list, add-edit
├── home/               home page
├── profile/            details, update
├── app.component.*     root component + nav bar
├── app.module.ts       root module (fake backend toggle)
└── app-routing.module.ts
src/environments/
├── environment.ts          dev  → http://localhost:4000
└── environment.prod.ts     prod → https://ipt-2026-backend.onrender.com
```

---

## Connecting to the Real Backend

When running against the real Node.js/MySQL API, the fake backend is automatically
disabled in production builds (`environment.production === true`).

For local development against a real backend, remove `fakeBackendProvider` from
`src/app/app.module.ts`.

---

## Build for Production

```bash
npm run build
# Output: dist/ipt-2026-frontend/
```

---

## Deploy to Render (Static Site)

| Setting | Value |
|---------|-------|
| Service type | Static Site |
| Branch | main |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist/ipt-2026-frontend` |

**SPA Routing (required):**  
Render → Redirects/Rewrites → Add rule:
- Source: `/*`
- Destination: `/index.html`
- Action: **Rewrite** *(not Redirect — Rewrite is required for email verify links to work)*

---

## Environment Variables

Production `environment.prod.ts` points to:
```
apiUrl: 'https://ipt-2026-backend.onrender.com'
```
Update this to your own deployed backend URL before deploying.

### Backend must have (for cookie auth to work):
```
CORS_ORIGIN=https://<your-render-frontend-domain>
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
```

---

## Routes

| Route | Description | Guard |
|-------|-------------|-------|
| `/` | Home | Auth |
| `/account/login` | Login | Public |
| `/account/register` | Register | Public |
| `/account/verify-email?token=...` | Verify email | Public |
| `/account/forgot-password` | Forgot password | Public |
| `/account/reset-password?token=...` | Reset password | Public |
| `/profile` | View profile | Auth |
| `/profile/update` | Edit profile | Auth |
| `/admin` | Admin overview | Admin only |
| `/admin/accounts` | Manage accounts | Admin only |
| `/admin/accounts/add` | Add account | Admin only |
| `/admin/accounts/edit/:id` | Edit account | Admin only |
