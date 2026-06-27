# Cymor Love Hub

AI-powered cinematic romantic experience generator. Built with Node.js, Express, MongoDB, Cloudinary, and Gemini AI.

---

## Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary (photos + music uploads)
- **AI**: Google Gemini 1.5 Flash
- **Frontend**: Vanilla HTML/CSS/JS (no framework)
- **Deploy**: Render (single service)

---

## Local Setup

```bash
# 1. Clone and install
npm install

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Run locally
npm run dev
```

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers |
| `GEMINI_API_KEY` | Google AI Studio (aistudio.google.com) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard → API Keys |
| `NODE_ENV` | Set to `production` on Render |

---

## Deploy to Render

1. Push this repo to GitHub
2. Go to render.com → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
5. Add all environment variables from the table above
6. Deploy

Render free tier will work. The service serves both frontend and backend from one port.

---

## Project Structure

```
cymor-love-hub/
├── server.js                  # Entry point
├── package.json
├── .env.example
├── src/
│   ├── controllers/
│   │   └── letterController.js
│   ├── routes/
│   │   └── letterRoutes.js
│   ├── services/
│   │   └── geminiService.js
│   ├── models/
│   │   └── Letter.js
│   ├── middleware/
│   │   └── rateLimiter.js
│   └── utils/
│       ├── logger.js
│       └── cloudinary.js
└── public/
    ├── index.html             # Landing page
    ├── create.html            # Create experience
    ├── experience.html        # Recipient cinematic view
    ├── css/
    │   ├── landing.css
    │   ├── create.css
    │   └── experience.css
    └── js/
        ├── landing.js
        ├── create.js
        └── experience.js
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/letters/generate` | Create experience (multipart/form-data) |
| `GET` | `/api/letters/:id` | Get experience by shareId |
| `POST` | `/api/letters/:id/react` | Add emoji reaction |

---

## Pages

| Route | Page |
|---|---|
| `/` | Landing page |
| `/create` | Create experience form |
| `/l/:id` | Recipient cinematic experience |

---

## Built-in Music

To add actual built-in music tracks, place MP3 files in `/public/audio/` named:
- `soft-piano.mp3`
- `romantic-strings.mp3`
- `golden-sunset.mp3`
- `moonlight.mp3`
- `rain-dance.mp3`
- `acoustic-love.mp3`

Then update `experience.js` `MUSIC_URLS` map to point to `/audio/filename.mp3`.

---

## Rate Limits

- General API: 100 requests / 15 minutes
- Generate endpoint: 10 requests / hour (per IP)

---

Built with love by Cymor Tech Services 🇰🇪
