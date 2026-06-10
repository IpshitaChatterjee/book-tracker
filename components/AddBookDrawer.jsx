'use client';

import { useState, useEffect, useRef } from 'react';

const StarFillSVG = () => (
  <svg className="star-icon star-fill" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
    viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarEmptySVG = () => (
  <svg className="star-icon star-empty" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

function compressImage(base64Image, maxWidth = 200, maxHeight = 300, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      let width = img.width, height = img.height;
      if (width > height) {
        if (width > maxWidth) { height = height * (maxWidth / width); width = maxWidth; }
      } else {
        if (height > maxHeight) { width = width * (maxHeight / height); height = maxHeight; }
      }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64Image;
  });
}

function RatingStars({ rating, hover, onRate, onHover, onLeave }) {
  return (
    <div className="rating-input" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button"
          className={`bd-star-interactive${(hover || rating) >= i ? ' active' : ''}`}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          onClick={() => onRate(i)} onMouseEnter={() => onHover(i)}>
          {(hover || rating) >= i ? <StarFillSVG /> : <StarEmptySVG />}
        </button>
      ))}
    </div>
  );
}

const DEFAULT_GENRES = ['Mystery/Thriller', 'Fantasy', 'Sci-Fi'];

export default function AddBookDrawer({ open, onClose, onSave, title = 'Add Book', submitLabel = 'Add Book', showDateFinished = true, showRating = true, existingGenres = [] }) {
  const [cover, setCover] = useState(null);
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const [showCustomGenre, setShowCustomGenre] = useState(false);
  const [synopsis, setSynopsis] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [lookupStatus, setLookupStatus] = useState({ text: '', color: '' });
  const lookupTimer = useRef(null);

  const allGenres = [...new Set([...DEFAULT_GENRES, ...existingGenres])];

  useEffect(() => {
    if (!open) return;
    const onPaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = async (evt) => setCover(await compressImage(evt.target.result));
          reader.readAsDataURL(blob);
          break;
        }
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setCover(null); setBookTitle(''); setAuthor(''); setGenre('');
      setCustomGenre(''); setShowCustomGenre(false); setSynopsis('');
      setRating(0); setRatingHover(0); setLookupStatus({ text: '', color: '' });
      setDate(new Date().toISOString().split('T')[0]);
    }
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  async function handleCoverFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => setCover(await compressImage(e.target.result));
    reader.readAsDataURL(file);
  }

  async function lookupBook(val) {
    if (val.length < 3) { setLookupStatus({ text: '', color: '' }); return; }
    setLookupStatus({ text: 'Looking up book details...', color: 'var(--text-muted)' });
    clearTimeout(lookupTimer.current);
    lookupTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            max_tokens: 1000,
            messages: [{ role: 'user', content: `For the book titled "${val}", provide the following information in JSON format only (no markdown, no code blocks, just raw JSON):\n{\n  "author": "author name",\n  "genre": "one of: Mystery/Thriller, Fantasy, Sci-Fi, or Other",\n  "rating": "X.X/5",\n  "synopsis": "one paragraph synopsis"\n}\n\nIf you don't recognize this book, return: {"error": "Book not found"}\n\nResponse must be valid JSON only.` }],
          }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.content?.[0]?.text) {
          const parsed = JSON.parse(data.content[0].text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, ''));
          if (parsed.error) {
            setLookupStatus({ text: '❌ Book not found — add details manually', color: 'var(--gold)' });
          } else if (parsed.genre === 'Other') {
            setLookupStatus({ text: `✓ Found: ${parsed.author} — please specify genre`, color: 'var(--gold)' });
            setAuthor(parsed.author); setGenre('Other'); setShowCustomGenre(true); setSynopsis(parsed.synopsis);
          } else {
            setLookupStatus({ text: `✓ Found: ${parsed.author} — ${parsed.genre}`, color: 'var(--green-light)' });
            setAuthor(parsed.author); setGenre(parsed.genre); setSynopsis(parsed.synopsis);
          }
        }
      } catch {
        setLookupStatus({ text: '⚠ Could not fetch details — add manually', color: 'var(--gold)' });
      }
    }, 1000);
  }

  function handleSubmit() {
    if (!bookTitle.trim()) return;
    onSave({
      title: bookTitle.trim(),
      author,
      genre: customGenre || genre,
      synopsis,
      rating,
      coverImage: cover,
      ...(showDateFinished ? { dateFinished: date } : {}),
    });
  }

  if (!open) return null;

  return (
    <div
      className="book-detail-overlay active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="addDrawerTitle"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="book-detail-modal">

        <div className="bd-drawer-header">
          <span className="bd-drawer-title" id="addDrawerTitle">{title}</span>
          <button className="book-detail-close" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="bd-drawer-body">
          <div className="bd-cover-row editing">
            <div className="bd-cover-wrap">
              <div className="bd-cover">
                {cover ? <img src={cover} alt="Cover preview" /> : '📚'}
                <label className="bd-cover-edit-btn" htmlFor="addCoverInputDrawer" title="Upload cover">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                  </svg>
                  Upload
                </label>
              </div>
              <input type="file" id="addCoverInputDrawer" accept="image/png,image/jpeg,image/jpg" style={{ display: 'none' }}
                onChange={e => { handleCoverFile(e.target.files[0]); e.target.value = ''; }} />
            </div>

            <div className="bd-cover-meta">
              <input type="text" className="bd-edit-input bd-edit-title-input" aria-label="Title"
                placeholder="Book title..." value={bookTitle}
                onChange={e => { setBookTitle(e.target.value); lookupBook(e.target.value); }} />
              {lookupStatus.text && (
                <div className="bd-lookup-status" style={{ color: lookupStatus.color }}>{lookupStatus.text}</div>
              )}
              <input type="text" className="bd-edit-input" aria-label="Author" placeholder="Author..."
                value={author} onChange={e => setAuthor(e.target.value)} />
              <select className={`bd-edit-select${!genre ? ' placeholder' : ''}`} aria-label="Genre" value={genre}
                onChange={e => { setGenre(e.target.value); setShowCustomGenre(e.target.value === 'Other'); if (e.target.value !== 'Other') setCustomGenre(''); }}>
                <option value="">Genre...</option>
                {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
                <option value="Other">Other (create new)</option>
              </select>
              {showRating && (
                <div className="bd-stars">
                  <RatingStars rating={rating} hover={ratingHover} onRate={setRating}
                    onHover={setRatingHover} onLeave={() => setRatingHover(0)} />
                </div>
              )}
            </div>
          </div>

          {showCustomGenre && (
            <div className="form-group" style={{ margin: 0 }}>
              <input type="text" className="bd-edit-input" style={{ width: '100%', boxSizing: 'border-box' }}
                value={customGenre} placeholder="Enter custom genre name..." onChange={e => setCustomGenre(e.target.value)} />
              <div className="genre-hint" style={{ marginTop: 4 }}>This genre will be added to the dropdown for future use</div>
            </div>
          )}

          <textarea className="bd-edit-textarea" aria-label="Synopsis"
            placeholder="Synopsis (auto-filled from lookup or enter manually)..."
            value={synopsis} onChange={e => setSynopsis(e.target.value)} />

          {showDateFinished && (
            <div className="bd-edit-date-wrap">
              <label className="bd-edit-label" htmlFor="addDateFinishedDrawer">Date Finished</label>
              <input type="date" className="bd-edit-input" id="addDateFinishedDrawer"
                style={{ width: 'auto' }} value={date} onChange={e => setDate(e.target.value)} />
            </div>
          )}

        </div>

        <div className="bd-drawer-footer">
          <button className="bd-btn bd-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="bd-btn bd-btn-save" onClick={handleSubmit}>{submitLabel}</button>
        </div>

      </div>
    </div>
  );
}
