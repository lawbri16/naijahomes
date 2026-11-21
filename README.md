# NaijaHomes: Real Estate Management System

React (Vite) + Express + MongoDB. No mock data: everything is stored in and read from the database.

## Who uses it
| Portal | URL | Who | Can do |
|---|---|---|---|
| Client | /login, /register | Prospective tenants / buyers | Browse, search, filter, send rental enquiries, see their tenancy and rent payment history |
| Agent | /agent/login, /agent/register | Agents and property owners | Add listings with images, edit/delete, publish owner listings (agents), receive enquiries, create tenancies, record rent payments |
| Admin | /agent/login | Administrator | Everything above, plus manage users and review pending listings |

Owner listings stay hidden until an agent or admin publishes them. Admin accounts cannot be self-registered.

## Run it
Needs Node 18+ and MongoDB (local, or a free Atlas connection string).

1. `npm run install-all`  (installs backend, frontend and the root runner)
2. Copy `backend/.env.example` to `backend/.env` and fill it in (MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD)
3. `npm run admin`  (creates the admin account from your .env)
4. `npm run dev`  (API on :5000, website on :5173)
5. Open http://localhost:5173

Or run separately: `cd backend && npm run dev` and `cd frontend && npm run dev`.

## Try the whole flow
1. Register as a **property owner** at /agent/register, then add a property (it is Pending)
2. Register as an **agent** at /agent/register (use another email), open Pending listings, Publish
3. The listing now shows on /properties (search, filter and sort it)
4. Register as a **client** at /register, open the listing, send an enquiry
5. As owner or agent: Enquiries to read it; Tenants & rent > New tenancy using the client's email
6. Record rent payments; the client sees them under their dashboard
7. Log in as admin at /agent/login for users and all listings

## Notes
- Uploaded images are saved in `backend/uploads` (fine for development; use cloud storage if you deploy to a host with temporary disks).
- The login token is stored in localStorage.
