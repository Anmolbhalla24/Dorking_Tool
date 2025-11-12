const express = require('express')
const axios = require('axios')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')
require('dotenv').config()

const app = express()
app.use(express.json())

// === Config ===
const PORT = process.env.PORT || 5000
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''
const GOOGLE_CX = process.env.GOOGLE_CX || ''
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',')

// Allow CORS for your frontend(s)
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, mobile apps, or server-to-server)
    if (!origin) return callback(null, true)
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return callback(null, true)
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
    return callback(new Error(msg), false)
  }
}))

// === Data file for bookmarks/folders ===
const DATA_DIR = path.join(__dirname, 'data')
const BOOKMARK_FILE = path.join(DATA_DIR, 'bookmarks.json')

// Ensure data dir & file exist
async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    try {
      await fs.access(BOOKMARK_FILE)
    } catch {
      // create initial structure
      const initial = { folders: [] }
      await fs.writeFile(BOOKMARK_FILE, JSON.stringify(initial, null, 2), 'utf8')
    }
  } catch (e) {
    console.error('Failed to ensure data file:', e)
    throw e
  }
}

async function readData() {
  await ensureDataFile()
  const raw = await fs.readFile(BOOKMARK_FILE, 'utf8')
  return JSON.parse(raw)
}

async function writeData(obj) {
  await ensureDataFile()
  await fs.writeFile(BOOKMARK_FILE, JSON.stringify(obj, null, 2), 'utf8')
}

// === Google Custom Search proxy ===
// GET /search?q=...
app.get('/search', async (req, res) => {
  const q = req.query.q
  if (!q) return res.status(400).json({ error: 'Missing q parameter' })

  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    return res.status(500).json({ error: 'Server not configured with GOOGLE_API_KEY and GOOGLE_CX' })
  }

  try {
    const url = 'https://www.googleapis.com/customsearch/v1'
    const r = await axios.get(url, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        q,
        num: req.query.num || 10 // optional parameter
      },
      timeout: 10000
    })
    // return the API response directly
    res.json(r.data)
  } catch (err) {
    console.error('Search error:', err?.response?.data || err.message)
    res.status(500).json({ error: 'Search failed', details: err?.response?.data || err.message })
  }
})

// === Folder & Bookmark CRUD ===
// Structure stored: { folders: [ { id, name, bookmarks: [ {id,url,title,note,addedAt} ] } ] }

// GET /folders
app.get('/folders', async (req, res) => {
  try {
    const data = await readData()
    res.json(data.folders || [])
  } catch (e) {
    res.status(500).json({ error: 'Failed to read folders', details: e.message })
  }
})

// POST /folders  { name: "Important" }
app.post('/folders', async (req, res) => {
  const name = (req.body.name || '').toString().trim()
  if (!name) return res.status(400).json({ error: 'Missing folder name' })
  try {
    const data = await readData()
    const id = Date.now().toString()
    const folder = { id, name, bookmarks: [] }
    data.folders.unshift(folder)
    await writeData(data)
    res.status(201).json(folder)
  } catch (e) {
    res.status(500).json({ error: 'Failed to create folder', details: e.message })
  }
})

// DELETE /folders/:id
app.delete('/folders/:id', async (req, res) => {
  try {
    const id = req.params.id
    const data = await readData()
    const before = data.folders.length
    data.folders = data.folders.filter(f => f.id !== id)
    if (data.folders.length === before) return res.status(404).json({ error: 'Folder not found' })
    await writeData(data)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete folder', details: e.message })
  }
})

// POST /bookmarks  { folderId, url, title, note }
app.post('/bookmarks', async (req, res) => {
  const { folderId, url, title, note } = req.body
  if (!folderId || !url) return res.status(400).json({ error: 'Missing folderId or url' })
  try {
    const data = await readData()
    const folder = data.folders.find(f => f.id === folderId)
    if (!folder) return res.status(404).json({ error: 'Folder not found' })
    const bookmark = {
      id: Date.now().toString(),
      url: url.toString(),
      title: (title || '').toString(),
      note: (note || '').toString(),
      addedAt: new Date().toISOString()
    }
    folder.bookmarks.unshift(bookmark)
    await writeData(data)
    res.status(201).json(bookmark)
  } catch (e) {
    res.status(500).json({ error: 'Failed to add bookmark', details: e.message })
  }
})

// PUT /bookmarks/:id  { title?, note? } -> find bookmark in all folders and update
app.put('/bookmarks/:id', async (req, res) => {
  const id = req.params.id
  try {
    const data = await readData()
    let found = null
    for (const f of data.folders) {
      const b = f.bookmarks.find(b => b.id === id)
      if (b) { found = b; if (req.body.title !== undefined) b.title = req.body.title; if (req.body.note !== undefined) b.note = req.body.note; break }
    }
    if (!found) return res.status(404).json({ error: 'Bookmark not found' })
    await writeData(data)
    res.json(found)
  } catch (e) {
    res.status(500).json({ error: 'Failed to update bookmark', details: e.message })
  }
})

// DELETE /bookmarks/:id -> find & remove
app.delete('/bookmarks/:id', async (req, res) => {
  const id = req.params.id
  try {
    const data = await readData()
    let removed = false
    data.folders = data.folders.map(f => ({ ...f, bookmarks: f.bookmarks.filter(b => { if (b.id === id) { removed = true; return false } return true }) }))
    if (!removed) return res.status(404).json({ error: 'Bookmark not found' })
    await writeData(data)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete bookmark', details: e.message })
  }
})

// Simple health check
app.get('/ping', (req, res) => res.json({ ok: true, time: new Date().toISOString() }))

// Start
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(',')}`)
})
