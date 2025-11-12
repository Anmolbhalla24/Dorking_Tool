import React, { useEffect, useState, useMemo } from "react";
import "./index.css";

const STORAGE_KEY = "dorkFolders_v1";
const HISTORY_KEY = "dorkHistory_v1";

const initialFields = {
  // Core / boolean & phrase
  exactPhrase: "",
  exclude: "",
  OR: "",
  // Site / URL
  site: "",
  inurl: "",
  allinurl: "",
  link: "",
  related: "",
  // Title / header / anchor / body
  intitle: "",
  allintitle: "",
  intext: "",
  allintext: "",
  inanchor: "",
  allinanchor: "",
  inbody: "",
  inposttitle: "",
  inpostauthor: "",
  // File types & extensions
  filetype: "",
  ext: "",
  mime: "",
  // Cache / info / metadata
  cache: "",
  info: "",
  inpublisher: "",
  source: "",
  // Time / date
  before: "",
  after: "",
  daterange: "",
  // Numeric ranges / units
  range: "",
  // Special prefixes / service
  define: "",
  weather: "",
  stocks: "",
  map: "",
  book: "",
  phonebook: "",
  // Other/advanced
  ip: "",
  loc: "",
  group: "",
  // fallback / custom query field
  q: ""
};

// Section definitions (closed by default)
const SECTIONS = [
  {
    id: "core",
    label: "Core / Boolean / Phrase",
    keys: ["exactPhrase", "exclude", "OR", "q"]
  },
  {
    id: "site",
    label: "Site & URL Filters",
    keys: ["site", "inurl", "allinurl", "link", "related", "ip", "loc"]
  },
  {
    id: "title",
    label: "Title / Header / Anchor / Body",
    keys: [
      "intitle",
      "allintitle",
      "intext",
      "allintext",
      "inanchor",
      "allinanchor",
      "inbody",
      "inposttitle",
      "inpostauthor"
    ]
  },
  {
    id: "file",
    label: "File types & Extensions",
    keys: ["filetype", "ext", "mime"]
  },
  {
    id: "cache",
    label: "Cache / Info / Metadata",
    keys: ["cache", "info", "inpublisher", "source"]
  },
  {
    id: "date",
    label: "Date / Range / Numbers",
    keys: ["before", "after", "daterange", "range"]
  },
  {
    id: "services",
    label: "Special Google Service Prefixes",
    keys: ["define", "weather", "stocks", "map", "book", "phonebook"]
  },
  {
    id: "other",
    label: "Other / Legacy / Group",
    keys: ["group"]
  }
];

// Human readable labels & descriptions for each field
const FIELD_META = {
  exactPhrase: {
    label: 'Exact phrase ("...")',
    desc: 'Search for an exact phrase. Example: "admin password"'
  },
  exclude: {
    label: "Exclude (-term)",
    desc: "Exclude results containing this term. Example: -test"
  },
  OR: {
    label: "OR (comma separated)",
    desc: "Match any of the comma-separated terms. Example: login,admin"
  },
  q: {
    label: "Keywords (free text)",
    desc: "Any other plain keywords or phrases (no prefix)."
  },

  site: { label: "site:", desc: "Restrict results to a domain (e.g., example.com)." },
  inurl: { label: "inurl:", desc: "Find pages with the keyword in the URL." },
  allinurl: { label: "allinurl:", desc: "All words must appear in the URL." },
  link: { label: "link:", desc: "Find pages that link to a specific URL." },
  related: { label: "related:", desc: "Find sites related to a domain." },
  ip: { label: "ip:", desc: "Search by IP (legacy/rare)." },
  loc: { label: "loc:", desc: "Location-coded searches for some services." },

  intitle: { label: "intitle:", desc: "Find pages with the keyword in the title." },
  allintitle: { label: "allintitle:", desc: "All words must appear in the title." },
  intext: { label: "intext:", desc: "Search inside page text." },
  allintext: { label: "allintext:", desc: "All words must appear in the page body." },
  inanchor: { label: "inanchor:", desc: "Search words used in anchor text of links." },
  allinanchor: { label: "allinanchor:", desc: "All words must appear within anchor text." },
  inbody: { label: "inbody:", desc: "Legacy/body-specific searches (rare)." },
  inposttitle: { label: "inposttitle:", desc: "Blogger/blog-specific post title filter." },
  inpostauthor: { label: "inpostauthor:", desc: "Blogger/blog-specific author filter." },

  filetype: { label: "filetype:", desc: "Limit to file type (pdf, xls, docx)." },
  ext: { label: "ext:", desc: "Alternative to filetype (same usage)." },
  mime: { label: "mime:", desc: "MIME type filter (advanced/programmatic)." },

  cache: { label: "cache:", desc: "Show Google cached version; supply URL." },
  info: { label: "info:", desc: "Basic info about a URL (Google info operator)." },
  inpublisher: { label: "inpublisher:", desc: "News publisher filter." },
  source: { label: "source:", desc: "News source filter." },

  before: { label: "before:", desc: "Find results before date (YYYY-MM-DD)." },
  after: { label: "after:", desc: "Find results after date (YYYY-MM-DD)." },
  daterange: { label: "daterange:", desc: "Legacy Julian daterange (rare)." },
  range: { label: "Numeric range (..)", desc: "Numeric ranges, e.g., 2000..2020 or software versions." },

  define: { label: "define:", desc: "Show definition of a term." },
  weather: { label: "weather:", desc: "Weather queries (service prefix)." },
  stocks: { label: "stocks:", desc: "Stock quotes (service prefix)." },
  map: { label: "map:", desc: "Map queries (service prefix)." },
  book: { label: "book:", desc: "Books search prefix (limited)." },
  phonebook: { label: "phonebook:", desc: "Legacy phonebook search (rare)." },

  group: { label: "group:", desc: "Google Groups legacy search (rare)." }
};

function Field({ id, label, desc, value, onChange, placeholder }) {
  return (
    <div className="field" key={id}>
      <div className="label">{label}</div>
      <input
        id={id}
        key={id}
        className="input"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        autoComplete="off"
        spellCheck="false"
      />
      <div className="parameter-description">{desc}</div>
    </div>
  );
}

export default function App() {
  const [fields, setFields] = useState(() => ({ ...initialFields }));
  const [dork, setDork] = useState("");
  const [folders, setFolders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Collapsible sections (closed by default)
  const [openSections, setOpenSections] = useState(() =>
    SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: false }), {})
  );

  // Search filter for param names
  const [paramFilter, setParamFilter] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  function updateField(k, v) {
    setFields((p) => ({ ...p, [k]: v }));
  }

  function buildDorkString(saveToHistory = true) {
    const parts = [];

    // exact phrase
    if (fields.exactPhrase) parts.push(`"${fields.exactPhrase.trim()}"`);
    if (fields.exclude) parts.push(`-${fields.exclude.trim()}`);
    if (fields.OR) {
      const orParts = fields.OR
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (orParts.length) parts.push("(" + orParts.join(" OR ") + ")");
    }

    // add other fields generically (only if filled)
    const orderedKeys = [
      "site",
      "inurl",
      "allinurl",
      "link",
      "related",
      "ip",
      "loc",
      "intitle",
      "allintitle",
      "intext",
      "allintext",
      "inanchor",
      "allinanchor",
      "inbody",
      "inposttitle",
      "inpostauthor",
      "filetype",
      "ext",
      "mime",
      "cache",
      "info",
      "inpublisher",
      "source",
      "before",
      "after",
      "daterange",
      "range",
      "define",
      "weather",
      "stocks",
      "map",
      "book",
      "phonebook",
      "group",
      "q"
    ];

    for (const k of orderedKeys) {
      const v = fields[k];
      if (!v || String(v).trim() === "") continue;
      // q is free-text, don't prefix
      if (k === "q") {
        parts.push(String(v).trim());
      } else if (k === "range") {
        parts.push(String(v).trim()); // numeric range like 2000..2020
      } else {
        parts.push(`${k}:${String(v).trim()}`);
      }
    }

    const q = parts.join(" ").trim();
    setDork(q);
    if (q && saveToHistory) {
      setHistory((p) => [...p, { text: q, time: new Date().toLocaleString() }]);
    }
    return q;
  }

  function openGoogle() {
    const q = dork || buildDorkString();
    if (!q) return alert("Build a dork first.");
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank");
  }

  // folder/bookmark functions (same as before)
  function createFolder(name) {
    if (!name) return;
    const newFolder = { id: Date.now().toString(), name, bookmarks: [] };
    setFolders((p) => [newFolder, ...p]);
  }
  function saveBookmarkToFolder(folderId, url, title = "", note = "") {
    setFolders((p) =>
      p.map((f) => {
        if (f.id !== folderId) return f;
        const bookmark = { id: Date.now().toString(), url, title, note, addedAt: new Date().toISOString() };
        return { ...f, bookmarks: [bookmark, ...f.bookmarks] };
      })
    );
  }
  function removeBookmark(folderId, bookmarkId) {
    setFolders((p) => p.map((f) => (f.id !== folderId ? f : { ...f, bookmarks: f.bookmarks.filter((b) => b.id !== bookmarkId) })));
  }
  function exportFolders() {
    const dataStr = JSON.stringify(folders, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dork-folders.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function importFolders(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) setFolders(json);
        else alert("Invalid file format (expected an array).");
      } catch {
        alert("Failed to parse JSON.");
      }
    };
    reader.readAsText(file);
  }

  // history functions
  function clearHistory() {
    if (!confirm("Clear all history?")) return;
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }
  function deleteHistoryItem(i) {
    setHistory((p) => p.filter((_, idx) => idx !== i));
  }
  function loadHistoryItem(text) {
    setDork(text);
    // Optionally parse to fields? For now we just set dork string
    // Scroll to top for visibility
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // param search filter matching label or key
  const paramFilterLower = paramFilter => paramFilter.trim().toLowerCase();

  // compute filtered section keys based on search bar
  const filteredSections = useMemo(() => {
    const f = paramFilterLower(paramFilter || "");
    if (!f) return SECTIONS;
    return SECTIONS.map((s) => {
      const filteredKeys = s.keys.filter((k) => {
        const meta = FIELD_META[k] || {};
        const label = (meta.label || k).toLowerCase();
        const desc = (meta.desc || "").toLowerCase();
        return label.includes(f) || k.toLowerCase().includes(f) || desc.includes(f);
      });
      return { ...s, keys: filteredKeys };
    }).filter(s => s.keys.length > 0);
  }, [paramFilter]);

  return (
    <div className="app-root">
      <div className="container">
        <header className="topbar">
          <div>
            <h1 className="title">Google Dork Builder & Bookmark Tool</h1>
            <div className="subtitle">Neon dork builder — defensive research only</div>
          </div>

          <div className="top-actions">
            <input
              className="search-params-input"
              placeholder="Search parameters (e.g., filetype, inurl, cache...)"
              value={paramFilter}
              onChange={(e) => setParamFilter(e.target.value)}
            />
            <div className="small-note">Local storage keys: <code style={{color:'#7dff9a'}}>{STORAGE_KEY}</code> / <code style={{color:'#7dff9a'}}>{HISTORY_KEY}</code></div>
          </div>
        </header>

        <div className="grid grid-cols-3">
          {/* CENTER - builder */}
          <main className="card builder-panel">
            <h2 className="section-title">Dork Parameters</h2>

            {filteredSections.map((section) => (
              <section className="param-section" key={section.id}>
                <div className="section-row" onClick={() => setOpenSections((p) => ({ ...p, [section.id]: !p[section.id] }))}>
                  <div className="section-label">{section.label}</div>
                  <div className="section-toggle">{openSections[section.id] ? "▾" : "▸"}</div>
                </div>

                {openSections[section.id] && (
                  <div className="section-body">
                    <div className="field-grid">
                      {section.keys.map((k) => {
                        const meta = FIELD_META[k] || { label: k, desc: "" };
                        return (
                          <Field
                            key={k}
                            id={k}
                            label={meta.label}
                            desc={meta.desc}
                            value={fields[k]}
                            onChange={(v) => updateField(k, v)}
                            placeholder={meta.label.replace(":", "")}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            ))}

            <div className="actions-row">
              <button className="btn-ghost" onClick={() => buildDorkString()}>Build Dork</button>
              <button className="btn-primary" onClick={() => { buildDorkString(); openGoogle(); }}>Open Google Search</button>
              <button className="btn-ghost" onClick={() => { setFields({ ...initialFields }); setDork(""); }}>Clear</button>
            </div>

            {dork && (
              <div className="dork-output" role="status">
                <div className="dork-title">Generated Google Dork</div>
                <pre className="dork-text">{dork}</pre>
              </div>
            )}

            <div className="quick-save">
              <h4 style={{color:'var(--neon)'}}>Quick save (after visiting a result)</h4>
              <div className="small" style={{color:'var(--neon-soft)'}}>Paste page URL and save to a folder.</div>
              <div className="quick-row">
                <input id="quickUrl" className="input" placeholder="Paste page URL here" />
                <input id="quickTitle" className="input" placeholder="Optional title" style={{width:240}} />
              </div>
              <div className="quick-row" style={{marginTop:8}}>
                <select id="quickFolder" className="input" style={{width:240}}>
                  <option value="">Select folder</option>
                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <input id="quickNote" className="input" placeholder="Optional note" />
                <button className="btn-primary" onClick={()=>{
                  const urlEl = document.getElementById('quickUrl')
                  const titleEl = document.getElementById('quickTitle')
                  const folderSel = document.getElementById('quickFolder')
                  const noteEl = document.getElementById('quickNote')
                  if(!urlEl.value) return alert('Paste a URL first.')
                  if(!folderSel.value) return alert('Select a folder to save.')
                  saveBookmarkToFolder(folderSel.value, urlEl.value, titleEl.value || urlEl.value, noteEl.value || '')
                  urlEl.value=''; titleEl.value=''; noteEl.value=''; folderSel.value=''
                  alert('Saved!')
                }}>Save</button>
              </div>
            </div>
          </main>

          {/* RIGHT column: folders (top) and history (below) */}
          <aside className="side-column">
            <div className="card folders-panel">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3 className="section-title" style={{margin:0}}>Folders</h3>
              </div>

              <div style={{marginTop:8}}>
                <div className="small" style={{color:'var(--neon-soft)'}}>Create folders to organize saved pages</div>
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <input id="newFolder" className="input" placeholder="New folder name" />
                  <button className="btn-primary" onClick={()=>{
                    const el = document.getElementById('newFolder')
                    if(!el.value) return alert('Enter folder name')
                    createFolder(el.value)
                    el.value=''
                  }}>Create</button>
                </div>
              </div>

              <div style={{marginTop:12}}>
                {folders.length === 0 && <div className="small" style={{color:'var(--neon-soft)'}}>No folders yet</div>}
                {folders.map(folder => (
                  <div key={folder.id} className="folder-item">
                    <div>
                      <strong style={{color:'var(--neon)'}}>{folder.name}</strong>
                      <div className="small" style={{color:'var(--neon-soft)'}}>{folder.bookmarks.length} bookmarks</div>
                    </div>
                    <div style={{display:'flex', gap:8}}>
                      <button className="btn-ghost" onClick={() => setFolders(f => f.map(ff => ff.id===folder.id ? {...ff, open: !ff.open} : ff))}>
                        {folder.open ? 'Close' : 'Open'}
                      </button>
                    </div>

                    {folder.open && (
                      <div style={{marginTop:8}}>
                        {folder.bookmarks.length === 0 && <div className="small" style={{color:'var(--neon-soft)'}}>No bookmarks</div>}
                        {folder.bookmarks.map(b => (
                          <div key={b.id} className="bookmark">
                            <a href={b.url} target="_blank" rel="noreferrer" style={{color:'var(--neon)'}}>{b.title || b.url}</a>
                            <div className="small" style={{color:'var(--neon-soft)'}}>{b.note}</div>
                            <div style={{display:'flex', gap:6, marginTop:6}}>
                              <button className="btn-ghost" onClick={()=>{
                                const newNote = prompt('Edit note', b.note || '')
                                if(newNote === null) return
                                setFolders(prev => prev.map(f => {
                                  if(f.id !== folder.id) return f
                                  return { ...f, bookmarks: f.bookmarks.map(bb => bb.id === b.id ? {...bb, note: newNote} : bb) }
                                }))
                              }}>Edit</button>
                              <button className="btn-ghost" onClick={()=>{
                                if(!confirm('Remove bookmark?')) return
                                removeBookmark(folder.id, b.id)
                              }}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{marginTop:12, display:'flex', gap:8}}>
                <button className="btn-ghost" onClick={() => exportFolders()}>Export JSON</button>
                <label className="btn-ghost" style={{cursor:'pointer'}}>
                  Import
                  <input type="file" accept=".json" style={{display:'none'}} onChange={(e)=>importFolders(e.target.files[0])} />
                </label>
              </div>
            </div>

            {/* history below folders */}
            <div className="card history-panel">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3 className="section-title" style={{margin:0}}>🕘 Dork History</h3>
                <button className="btn-ghost" onClick={() => clearHistory()}>Clear</button>
              </div>

              <div style={{marginTop:10}}>
                {history.length === 0 && <div className="small" style={{color:'var(--neon-soft)'}}>No history yet</div>}
                {history.slice().reverse().map((h, idx) => {
                  const realIndex = history.length - 1 - idx;
                  return (
                    <div key={realIndex} className="history-item">
                      <div className="history-text" style={{color:'#fff'}}>{h.text || h}</div>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6}}>
                        <div className="small" style={{color:'var(--neon-soft)'}}>{h.time || ''}</div>
                        <div style={{display:'flex', gap:8}}>
                          <button className="btn-ghost" onClick={() => loadHistoryItem(h.text || h)}>Load</button>
                          <button className="btn-ghost" onClick={() => deleteHistoryItem(realIndex)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
