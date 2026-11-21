# Deploying NaijaHomes (GitHub + Cloudinary + Render)

The database is already on Atlas. This adds cloud image storage and a public link.

## 1. Cloudinary (image storage, free)
1. Sign up at cloudinary.com and open the Console dashboard.
2. Find your **Cloud name**, **API Key** and **API Secret** (Dashboard > "Go to API Keys").
3. Build one value from them: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
4. Put it in `backend/.env`: `CLOUDINARY_URL=cloudinary://...`
5. In the terminal: `cd backend`, `npm install` (installs the new cloudinary package), then `npm run migrate-images`.
   This uploads the images you already added locally and updates the database. Skip it if you have no listings yet.
6. Restart `npm run dev`. New uploads now go to Cloudinary.

## 2. GitHub
1. On github.com create a new empty repository (no README, no .gitignore), e.g. `naijahomes`.
2. In the VS Code terminal, in the naijahomes folder:
```
git init
git add .
git commit -m "NaijaHomes"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/naijahomes.git
git push -u origin main
```
3. Check on GitHub that `backend/.env` is NOT in the repo (it is excluded by .gitignore). If it is, delete the repo, remove it from your folder history and start again, because it contains your passwords.

## 3. Render
1. At render.com sign up with GitHub, then New > **Web Service** and pick your repo.
2. Settings:
   - Runtime: **Node**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Instance type: Free
3. Environment variables (Advanced):
   - `MONGO_URI` = the same Atlas string as your .env
   - `JWT_SECRET` = a long random text (can differ from local)
   - `CLOUDINARY_URL` = from step 1
   - `NODE_VERSION` = `22`
4. Click Create Web Service and wait for the build (a few minutes). Your link looks like `https://naijahomes-xxxx.onrender.com`.

Your admin account already exists in Atlas, so log in at `/agent/login` with the same details.

## Good to know
- Free Render services go to sleep after about 15 minutes idle; the first visit after that takes ~50 seconds to wake up.
- Atlas must allow Render's IPs. The "Allow access from anywhere" rule you set already does.
- Push changes with `git add .`, `git commit -m "message"`, `git push`; Render redeploys automatically.
- If a page like /properties gives "Not found" when refreshed on Render, the build did not create `frontend/dist`; check the Render build logs.
