# Elsewhere — AI travel scrapbook generator

Enter a destination and a number of days; Gemini writes your trip and the app lays it out as a multi-page, hand-crafted
travel scrapbook (cover, destination, illustrated route map, places, food & cafés, where to stay, one page per day, travel notes).
View it page by page, then download it as a PDF.

- **Frontend:** React + Vite + TypeScript + Tailwind CSS v4 + Lucide icons (`frontend/`)
- **Backend:** Python + FastAPI + Pydantic + Google Gen AI SDK, model `gemini-3.5-flash-lite` (`backend/`)
- No database. The Gemini key lives **only** in `backend/.env`.

## 1. Prerequisites (Mac)

- **Node.js 20+** and npm — check with `node -v`. Install from https://nodejs.org or `brew install node`.
- **Python 3.10+** — check with `python3 --version`. Install with `brew install python`.
- **A Gemini API key** (free tier is fine) from https://aistudio.google.com/apikey
- VS Code (optional): https://code.visualstudio.com

## 2. Extract and open in VS Code

```bash
cd ~/Downloads
unzip travel-journal.zip
cd travel-journal
code .
```
(If `code` isn't found: open VS Code → *File ▸ Open Folder…* → choose `travel-journal`.)
Use VS Code's built-in terminal (*Terminal ▸ New Terminal*); you need **two terminals** — one for the backend, one for the frontend.

## 3. Backend setup (terminal 1)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### Paste your Gemini key
Open `backend/.env` in VS Code and replace the placeholder:

```
GEMINI_API_KEY=paste-your-real-key-here
```
Save the file. Never commit `.env` (it is already in `.gitignore`).

### Start the backend
```bash
uvicorn app.main:app --reload --port 8000
```
Check it: open http://127.0.0.1:8000/api/health — you should see `"status":"ok"` and `"gemini_key_configured":true`.
(Interactive API docs: http://127.0.0.1:8000/docs)

## 4. Frontend setup (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

## 5. Use the app

Open **http://localhost:5173**. Flow: Landing page → *Start creating* → trip details → *Generate my travel journal* (20–60 s) →
flip through the scrapbook → *Download PDF*.

### Downloading the PDF
*Download PDF* opens your browser's print dialog with every journal page laid out on its own A4 sheet.
Choose **Save as PDF** as the destination (Chrome/Edge recommended), keep **Margins: None** and **Background graphics: on**, then Save.

## 6. How it behaves

- One Gemini request per journal; output is requested as JSON, parsed tolerantly, and validated with Pydantic. Malformed output is retried once.
- The prompt forbids invented opening hours, prices, hotel availability and exact distances; uncertain places are flagged "verify first" on the pages.
- Photos are optional: the backend looks up a lead image on Wikipedia/Wikimedia Commons (free, no key; `backend/app/services/photo_service.py`, swappable provider).
  If none is found, a hand-drawn SVG illustration is shown instead. Attribution is printed on the Travel Notes page when photos are used.
- Books are saved **in your browser** (IndexedDB) and appear in *My Travel Collection*; nothing is stored on the server (see section 6b).
- A small per-IP rate limit (default 6 journals / 10 min; `RATE_LIMIT_*` in `.env`) protects your free quota.

## 6a. What's new: templates, memory books, collection

- **Five templates** — Vintage Postcards, Monochrome Editorial, Playful Memories, Travel Magazine, Nature & Nostalgia. Each is its own visual system (cover, backgrounds, type, colours, page layouts, photo frames/collages, decor, headers/footers) in `frontend/src/templates/` (`kits/*.tsx` + `templates.css` design tokens). You choose one *before* generating (with a page-by-page preview) and can switch any time from the **Style** button in the viewer — the whole book re-renders.
- **Two ways to create**: *Plan a trip* (`/create`, unchanged behaviour plus a style step) and *Turn memories into a book* (`/memories`, 8 friendly questions, optional ones skippable, then photos, style, review).
- **Photos (memory books)**: JPG/JPEG/PNG/WebP, many at once, previews, captions, remove, reorder, choose a page per photo (cover, journey, a specific place, a food item, a day, keepsakes), "show whole photo" instead of cropping, collage layout per section (auto/hero/grid/scatter/strip). Originals are stored untouched; a ≤2200 px copy is used for display. Photos are **never sent to the server or to Gemini** — only your text, and photo ids + captions, are used.
- **No invented memories**: the memory prompt forbids invention, and `backend/app/services/memory_guard.py` enforces it after the model answers (only the places/food/days you supplied survive; empty answers stay empty). Memory books contain no recommendations. If Gemini fails you can build the book from your own words with no AI.
- **Photo placement order**: your explicit choice → a caption that names one of your places/dishes/"day N" → Gemini's hint (only for photos left on "let the book decide") → spread across cover / journey / keepsakes. If no photo is assigned to the cover, your first photo is re-used there.
- **My Travel Collection** (`/collection`): bookshelf of Upcoming and Completed books; open, download PDF again, edit details/captions, delete, or *Mark as completed* (opens the memory questionnaire with only destination/dates/length carried over — your itinerary is **not** converted).
- API: one new endpoint, `POST /api/memories/generate` (same key, rate limit and error handling as the journal endpoint).

## 6b. Where your data lives (storage limitations)

- Saved in the browser's **IndexedDB** (`elsewhere` database: `books` for content/metadata, `blobs` for photos). It survives refresh and restart, **per browser and per device** — it does not sync, there are no accounts, and clearing site data, using another browser, or a private/incognito window loses it (the app warns when storage is unavailable).
- Browsers cap storage (often a share of free disk) and may evict data under pressure; the collection page shows usage. Keep a PDF of anything precious.
- Photos picked in the wizard are only saved once the book is generated.
- Architecture is ready for cloud/accounts: all storage goes through `src/lib/db.ts` + `src/lib/library.tsx`; swap those for an API client and add auth server-side.

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| Form shows "backend is not responding" | Backend isn't running. In `backend/`: `source .venv/bin/activate && uvicorn app.main:app --reload --port 8000` |
| "GEMINI_API_KEY is not set" / key rejected | Check `backend/.env` (no quotes, no spaces), save, **restart uvicorn**. |
| "Quota or rate limit reached" (429) | Free-tier limit. Wait a minute and retry. |
| "Gemini could not find the configured model" | Set `GEMINI_MODEL=` in `backend/.env` to a model your key can use (default `gemini-3.5-flash-lite`). |
| "AI returned a journal we could not read" | Rare malformed output; press Generate again. |
| `command not found: uvicorn` | Activate the venv: `source backend/.venv/bin/activate`. |
| `address already in use` | Another process uses the port: `lsof -i :8000` then `kill <PID>`, or use `--port 8001` and change the proxy in `frontend/vite.config.ts`. |
| `pip install` fails on old Python | Use Python 3.10+ (`brew install python`), recreate the venv. |
| PDF is blank or has no colours | Tick **Background graphics** in the print dialog; use Chrome/Edge. |
| Fonts look plain | Fonts load from Google Fonts; you need internet on first load. |

## 8. Tests

```bash
cd backend && source .venv/bin/activate && pytest -q
```
(Gemini is mocked; tests never use your key or quota.)

## 9. Project structure

```
travel-journal/
├── README.md  .gitignore
├── backend/
│   ├── requirements.txt  .env.example
│   ├── tests/             test_service.py, test_memory.py
│   └── app/
│       ├── main.py  config.py        (GEMINI_API_KEY lives only in backend/.env)
│       ├── routes/                   health.py, journal.py, photos.py, memories.py
│       ├── services/                 gemini_service.py, prompt.py, memory_prompt.py, memory_guard.py, photo_service.py, rate_limit.py
│       ├── models/                   request.py, journal.py, design.py, memory.py
│       └── utils/                    errors.py, json_utils.py
└── frontend/src/
    ├── App.tsx  main.tsx  api.ts  store.tsx  types.ts  index.css  scrapbook.css
    ├── routes/        Landing, Create (details → style), Memories (8-question wizard), Collection, BookView (viewer, /book/:id and /sample)
    ├── templates/     registry.ts, content.ts (page model), common.tsx (collage/shell), decor.tsx, shared.tsx, kits/*.tsx (5 templates), templates.css
    ├── components/    site/, pages/ (original vintage pages), scrap/, book/ (BookRenderer, TemplatePicker), memory/ (PhotoStudio, ItemList), PrintRoot.tsx
    ├── lib/           books.ts, db.ts (IndexedDB), library.tsx, images.ts, router.tsx, print.ts, art.ts, pages.ts, usePhotos.ts
    └── data/          sample.ts, sampleMemory.ts (template previews only)
```
