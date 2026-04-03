'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { supabase, OWNER_UUID } from '@/lib/supabase';

// ─── SVG helpers ───────────────────────────────────────────────

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

const MoonSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const SunSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const LockClosedSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LockOpenSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

// ─── Utilities ────────────────────────────────────────────────

function compressImage(base64Image, maxWidth = 200, maxHeight = 300, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height = height * (maxWidth / width); width = maxWidth; }
      } else {
        if (height > maxHeight) { width = width * (maxHeight / height); height = maxHeight; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64Image;
  });
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const p = dateStr.split('-');
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : dateStr;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function getAllGenres(books) {
  const defaults = ['Mystery/Thriller', 'Fantasy', 'Sci-Fi'];
  const custom = [...new Set(
    books.map(b => b.genre).filter(g => g && g !== 'Other' && !defaults.includes(g))
  )].sort();
  return [...defaults, ...custom];
}

// ─── Star display (read-only) ────────────────────────────────

function Stars({ rating }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map(i => i <= rating ? <StarFillSVG key={i} /> : <StarEmptySVG key={i} />)}
    </>
  );
}

// ─── Interactive stars ────────────────────────────────────────

function RatingStars({ rating, hover, onRate, onHover, onLeave, className = 'star' }) {
  return (
    <div className="rating-input" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          className={`${className}${(hover || rating) >= i ? ' active' : ''}`}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          onClick={() => onRate(i)}
          onMouseEnter={() => onHover(i)}
        >★</button>
      ))}
      <span style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: '13px', color: 'var(--amber)', minWidth: 32, marginLeft: 4, fontWeight: 500 }}>
        {rating}/5
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────

export default function BookTracker() {
  // Core
  const [books, setBooks] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('library');
  const [selectedYear, setSelectedYear] = useState('all');

  // Add-book form
  const [addTitle, setAddTitle] = useState('');
  const [addRating, setAddRating] = useState(0);
  const [addRatingHover, setAddRatingHover] = useState(0);
  const [addDate, setAddDate] = useState(todayStr);
  const [addCover, setAddCover] = useState(null);
  const [lookupStatus, setLookupStatus] = useState({ text: '', color: '' });
  const [bookInfo, setBookInfo] = useState(null); // auto-filled from API
  const [showManual, setShowManual] = useState(false);
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualGenre, setManualGenre] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const [showCustomGenre, setShowCustomGenre] = useState(false);
  const [manualSynopsis, setManualSynopsis] = useState('');

  // Detail modal
  const [detailId, setDetailId] = useState(null);
  const [detailMode, setDetailMode] = useState('view');
  const [detailEditRating, setDetailEditRating] = useState(0);
  const [detailEditRatingHover, setDetailEditRatingHover] = useState(0);
  const [detailEditCover, setDetailEditCover] = useState(undefined); // undefined = unchanged
  const [detailEditTitle, setDetailEditTitle] = useState('');
  const [detailEditAuthor, setDetailEditAuthor] = useState('');
  const [detailEditGenre, setDetailEditGenre] = useState('');
  const [detailEditSynopsis, setDetailEditSynopsis] = useState('');
  const [detailEditDate, setDetailEditDate] = useState('');

  // Open menus
  const [openMenuId, setOpenMenuId] = useState(null);

  // Login modal
  const [showLogin, setShowLogin] = useState(false);
  const [loginPwd, setLoginPwd] = useState('');
  const [loginError, setLoginError] = useState('');

  // Undo toast
  const [undoBook, setUndoBook] = useState(null);
  const undoTimerRef = useRef(null);
  const deletedCacheRef = useRef(null);
  const gsapTimelinesRef = useRef([]);

  // Theme
  const [darkMode, setDarkMode] = useState(false);

  // Responsive books-per-shelf (synced with CSS grid columns)
  const [booksPerRow, setBooksPerRow] = useState(6);

  // Recommendations
  const [recs, setRecs] = useState(null);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState(false);

  // Lookup debounce
  const lookupTimerRef = useRef(null);

  // ─── Derived ───────────────────────────────────────────────

  const detailBook = books.find(b => b.id === detailId) ?? null;

  const filteredBooks = selectedYear === 'all'
    ? books
    : books.filter(b => new Date(b.dateFinished).getFullYear() === parseInt(selectedYear));

  const sortedBooks = [...filteredBooks].sort((a, b) =>
    new Date(b.dateFinished) - new Date(a.dateFinished)
  );

  const allYears = [...new Set(
    books.map(b => new Date(b.dateFinished).getFullYear())
  )].sort((a, b) => b - a);

  const allGenres = getAllGenres(books);

  const totalBooks = filteredBooks.length;
  const avgRating = totalBooks > 0
    ? (filteredBooks.reduce((s, b) => s + b.rating, 0) / totalBooks).toFixed(1)
    : 0;
  const genreCounts = {};
  filteredBooks.forEach(b => { genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1; });
  const favoriteGenre = Object.keys(genreCounts).length > 0
    ? Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b)
    : 'None';

  // ─── Init ──────────────────────────────────────────────────

  useEffect(() => {
    setIsOwner(localStorage.getItem('bt_owner') === '1');
    loadBooks();
  }, []);

  // Dark mode — sync with html.dark class
  useEffect(() => {
    const saved = localStorage.getItem('rt_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (saved === null && prefersDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('rt_theme', next ? 'dark' : 'light');
  }

  // Sync books-per-row with CSS grid breakpoints
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w > 960) setBooksPerRow(6);
      else if (w > 768) setBooksPerRow(4);
      else if (w > 480) setBooksPerRow(3);
      else setBooksPerRow(2);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Modal scroll lock
  useEffect(() => {
    document.body.style.overflow = detailId ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [detailId]);

  // ESC key
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return;
      if (detailId) {
        if (detailMode === 'edit') exitEditMode();
        else closeDetail();
      }
      if (showLogin) closeLogin();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [detailId, detailMode, showLogin]);

  // Close open card menu on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (!e.target.closest('.book-menu') && !e.target.closest('.delete-btn-icon')) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  // Clipboard paste for cover (Add tab only)
  useEffect(() => {
    async function onPaste(e) {
      if (activeTab !== 'add') return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = async (evt) => {
            const compressed = await compressImage(evt.target.result);
            setAddCover(compressed);
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    }
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [activeTab]);

  // ─── GSAP book hover animations ───────────────────────────
  useLayoutEffect(() => {
    // Kill & clean up previous timelines
    gsapTimelinesRef.current.forEach(({ tl, card, onEnter, onLeave }) => {
      tl.kill();
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
    });
    gsapTimelinesRef.current = [];

    const cards = document.querySelectorAll('.book-card[data-book-id]');
    cards.forEach(card => {
      const image   = card.querySelector('.books__image');
      const effect  = card.querySelector('.books__effect');
      const light   = card.querySelector('.books__light');
      const pages   = card.querySelectorAll('.books__page');
      const shadow  = card.querySelector('.book-contact-shadow');
      if (!image) return;

      gsap.set(image, { boxShadow: '10px -5px 20px rgba(0,0,0,0.15), 20px 0px 30px rgba(0,0,0,0.15)' });
      gsap.set(light, { opacity: 0.1 });
      gsap.set(pages, { x: 0 });

      const tl = gsap.timeline({ paused: true, defaults: { duration: 0.7, ease: 'power2.out' } });

      tl.to(image,   { translateX: -10, scaleX: 0.96, boxShadow: '20px 5px 20px rgba(0,0,0,0.3), 30px 0px 30px rgba(0,0,0,0.15)' }, 0);
      tl.to(effect,  { marginLeft: 10 }, 0);
      tl.to(light,   { opacity: 0.2 }, 0);
      tl.to(shadow,  { width: '85%', opacity: 0.9 }, 0);
      if (pages[0]) tl.to(pages[0], { x: '2px',  ease: 'power1.inOut' }, 0);
      if (pages[1]) tl.to(pages[1], { x: '0px',  ease: 'power1.inOut' }, 0);
      if (pages[2]) tl.to(pages[2], { x: '-2px', ease: 'power1.inOut' }, 0);

      const onEnter = () => tl.play();
      const onLeave = () => tl.reverse();
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
      gsapTimelinesRef.current.push({ tl, card, onEnter, onLeave });
    });

    return () => {
      gsapTimelinesRef.current.forEach(({ tl, card, onEnter, onLeave }) => {
        tl.kill();
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mouseleave', onLeave);
      });
      gsapTimelinesRef.current = [];
    };
  }, [sortedBooks]);

  // ─── Supabase ──────────────────────────────────────────────

  async function loadBooks() {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', OWNER_UUID)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBooks(data.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author || '',
        genre: b.genre,
        rating: b.rating,
        dateFinished: b.date_finished,
        coverImage: b.cover_image,
        synopsis: b.synopsis || '',
        apiRating: b.api_rating || '',
      })));
    } catch (err) {
      console.error('Error loading books:', err);
    }
  }

  async function saveBookToSupabase(book) {
    const { data, error } = await supabase
      .from('books')
      .insert([{
        user_id: OWNER_UUID,
        title: book.title,
        author: book.author,
        genre: book.genre,
        rating: book.rating,
        date_finished: book.dateFinished,
        cover_image: book.coverImage,
        synopsis: book.synopsis,
        api_rating: book.apiRating,
      }])
      .select();
    if (error) throw error;
    return data[0].id;
  }

  async function updateBookInSupabase(book) {
    const { error } = await supabase
      .from('books')
      .update({
        title: book.title,
        author: book.author,
        genre: book.genre,
        rating: book.rating,
        date_finished: book.dateFinished,
        cover_image: book.coverImage,
        synopsis: book.synopsis,
        api_rating: book.apiRating,
      })
      .eq('id', book.id)
      .eq('user_id', OWNER_UUID);
    if (error) throw error;
  }

  async function deleteBookFromSupabase(bookId) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)
      .eq('user_id', OWNER_UUID);
    if (error) throw error;
  }

  // ─── Auth ──────────────────────────────────────────────────

  function openLogin() {
    setLoginPwd('');
    setLoginError('');
    setShowLogin(true);
  }

  function closeLogin() {
    setShowLogin(false);
  }

  function handleAuthBtn() {
    if (isOwner) {
      localStorage.removeItem('bt_owner');
      setIsOwner(false);
      setActiveTab('library');
    } else {
      openLogin();
    }
  }

  function handleLoginSubmit() {
    if (loginPwd === 'book-tracker') {
      localStorage.setItem('bt_owner', '1');
      setIsOwner(true);
      closeLogin();
    } else {
      setLoginError('Incorrect password.');
      setLoginPwd('');
    }
  }

  // ─── Add book ──────────────────────────────────────────────

  async function handleCoverFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setAddCover(await compressImage(e.target.result));
    };
    reader.readAsDataURL(file);
  }

  async function lookupBook(title) {
    if (title.length < 3) {
      setLookupStatus({ text: '', color: '' });
      setShowManual(false);
      setBookInfo(null);
      return;
    }
    setLookupStatus({ text: 'Looking up book details...', color: 'var(--text-muted)' });
    clearTimeout(lookupTimerRef.current);
    lookupTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `For the book titled "${title}", provide the following information in JSON format only (no markdown, no code blocks, just raw JSON):\n{\n  "author": "author name",\n  "genre": "one of: Mystery/Thriller, Fantasy, Sci-Fi, or Other",\n  "rating": "X.X/5",\n  "synopsis": "one paragraph synopsis"\n}\n\nIf you don't recognize this book, return: {"error": "Book not found"}\n\nResponse must be valid JSON only.`,
            }],
          }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        if (data.content?.[0]?.text) {
          let json = data.content[0].text.trim()
            .replace(/```json\n?/g, '').replace(/```\n?/g, '');
          const parsed = JSON.parse(json);
          if (parsed.error) {
            setLookupStatus({ text: '❌ Book not found — please add details manually below', color: 'var(--gold)' });
            setShowManual(true);
          } else if (parsed.genre === 'Other') {
            setLookupStatus({ text: `✓ Found: ${parsed.author} — please specify genre below`, color: 'var(--gold)' });
            setShowManual(true);
            setManualAuthor(parsed.author);
            setManualGenre('Other');
            setShowCustomGenre(true);
            setManualSynopsis(parsed.synopsis);
            setBookInfo({ author: parsed.author, genre: parsed.genre, synopsis: parsed.synopsis, apiRating: parsed.rating });
          } else {
            setLookupStatus({ text: `✓ Found: ${parsed.author} — ${parsed.genre}`, color: 'var(--green-light)' });
            setShowManual(false);
            setBookInfo({ author: parsed.author, genre: parsed.genre, synopsis: parsed.synopsis, apiRating: parsed.rating });
          }
        }
      } catch {
        setLookupStatus({ text: '⚠ Could not fetch details — you can add manually below', color: 'var(--gold)' });
        setShowManual(true);
      }
    }, 1000);
  }

  async function handleAddBook() {
    if (!addTitle.trim()) return;
    if (!addRating) return;
    if (!addDate) return;

    let finalGenre = 'Other', finalAuthor = '', finalSynopsis = '', finalApiRating = '';

    if (showManual) {
      finalAuthor = manualAuthor;
      if (manualGenre === 'Other') {
        if (!customGenre.trim()) return;
        const norm = customGenre.trim().split(' ').map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        const match = allGenres.find(g => g.toLowerCase() === norm.toLowerCase());
        finalGenre = match || norm;
      } else if (manualGenre) {
        finalGenre = manualGenre;
      }
      finalSynopsis = manualSynopsis;
      if (bookInfo) finalApiRating = bookInfo.apiRating || '';
    } else if (bookInfo) {
      finalGenre = bookInfo.genre || 'Other';
      finalAuthor = bookInfo.author || '';
      finalSynopsis = bookInfo.synopsis || '';
      finalApiRating = bookInfo.apiRating || '';
    }

    const book = {
      id: Date.now(),
      title: addTitle.trim(),
      genre: finalGenre,
      rating: addRating,
      dateFinished: addDate,
      coverImage: addCover,
      author: finalAuthor,
      synopsis: finalSynopsis,
      apiRating: finalApiRating,
    };

    try {
      const newId = await saveBookToSupabase(book);
      book.id = newId;
      setBooks(prev => [book, ...prev]);

      // Reset form
      setAddTitle('');
      setAddRating(0);
      setAddRatingHover(0);
      setAddDate(todayStr());
      setAddCover(null);
      setLookupStatus({ text: '', color: '' });
      setBookInfo(null);
      setShowManual(false);
      setManualAuthor('');
      setManualGenre('');
      setCustomGenre('');
      setShowCustomGenre(false);
      setManualSynopsis('');

      setActiveTab('library');
    } catch (err) {
      console.error('Error adding book:', err);
      alert('Error adding book. Check console for details.');
    }
  }

  // ─── Delete ────────────────────────────────────────────────

  async function deleteBook(bookId) {
    await deleteBookFromSupabase(bookId);
    setBooks(prev => prev.filter(b => b.id !== bookId));
  }

  async function handleDeleteBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    deletedCacheRef.current = { ...book };
    await deleteBook(bookId);
    showUndo(deletedCacheRef.current);
  }

  // ─── Detail modal ──────────────────────────────────────────

  function openDetail(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    setDetailId(bookId);
    setDetailMode('view');
    setDetailEditRating(book.rating);
    setDetailEditCover(undefined);
  }

  function openDetailInEdit(bookId) {
    openDetail(bookId);
    // slight delay so state settles before switching mode
    setTimeout(() => enterEditMode(bookId), 0);
  }

  function closeDetail() {
    setDetailId(null);
    setDetailMode('view');
    setDetailEditCover(undefined);
  }

  function enterEditMode(bookId) {
    const book = books.find(b => b.id === (bookId ?? detailId));
    if (!book) return;
    setDetailEditTitle(book.title);
    setDetailEditAuthor(book.author || '');
    setDetailEditGenre(book.genre || allGenres[0]);
    setDetailEditSynopsis(book.synopsis || '');
    setDetailEditDate(book.dateFinished || '');
    setDetailEditRating(book.rating);
    setDetailEditRatingHover(0);
    setDetailEditCover(undefined);
    setDetailMode('edit');
  }

  function exitEditMode() {
    const book = books.find(b => b.id === detailId);
    setDetailEditRating(book?.rating ?? 0);
    setDetailEditCover(undefined);
    setDetailMode('view');
  }

  async function handleDetailEditCover(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setDetailEditCover(await compressImage(e.target.result));
    };
    reader.readAsDataURL(file);
  }

  async function saveDetailChanges() {
    const book = books.find(b => b.id === detailId);
    if (!book) return;
    if (!detailEditTitle.trim() || !detailEditDate) return;

    const updated = {
      ...book,
      title: detailEditTitle.trim(),
      author: detailEditAuthor.trim(),
      genre: detailEditGenre,
      synopsis: detailEditSynopsis.trim(),
      rating: detailEditRating || book.rating,
      dateFinished: detailEditDate,
      coverImage: detailEditCover !== undefined ? detailEditCover : book.coverImage,
    };

    try {
      await updateBookInSupabase(updated);
      setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
      closeDetail();
    } catch (err) {
      console.error('Failed to save changes:', err);
    }
  }

  async function handleDeleteFromDetail() {
    const bookId = detailId;
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    deletedCacheRef.current = { ...book };
    closeDetail();
    await deleteBook(bookId);
    showUndo(deletedCacheRef.current);
  }

  // ─── Undo toast ────────────────────────────────────────────

  function showUndo(book) {
    clearTimeout(undoTimerRef.current);
    setUndoBook(book);
    undoTimerRef.current = setTimeout(() => {
      setUndoBook(null);
      deletedCacheRef.current = null;
    }, 5000);
  }

  async function handleUndo() {
    const book = deletedCacheRef.current;
    if (!book) return;
    clearTimeout(undoTimerRef.current);
    setUndoBook(null);
    deletedCacheRef.current = null;
    try {
      const newId = await saveBookToSupabase(book);
      setBooks(prev => [{ ...book, id: newId }, ...prev]);
    } catch (err) {
      console.error('Failed to undo delete:', err);
    }
  }

  // ─── Recommendations ───────────────────────────────────────

  async function generateRecommendations() {
    if (books.length === 0) return;
    setRecsLoading(true);
    setRecsError(false);
    setRecs(null);

    try {
      const liked = books.filter(b => b.rating >= 3).map(b => ({ title: b.title, author: b.author || 'Unknown', genre: b.genre, rating: b.rating }));
      const disliked = books.filter(b => b.rating <= 2).map(b => ({ title: b.title, genre: b.genre }));

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `Based on these reading preferences, recommend 5 books I should read next.\n\nBooks I enjoyed (rated 3-5 stars):\n${JSON.stringify(liked, null, 2)}\n\nBooks I didn't enjoy (rated 1-2 stars):\n${JSON.stringify(disliked, null, 2)}\n\nProvide exactly 5 recommendations in this JSON format (no markdown, raw JSON array only):\n[\n  {\n    "title": "Book Title",\n    "author": "Author Name",\n    "genre": "Genre",\n    "reason": "Why I would enjoy this based on my reading history"\n  }\n]`,
          }],
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.content?.[0]?.text) {
        let json = data.content[0].text.trim()
          .replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecs(parsed);
        } else {
          throw new Error();
        }
      }
    } catch {
      setRecsError(true);
    } finally {
      setRecsLoading(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="app-shell">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div>
              <div className="sidebar-logo-text">Reading Trove</div>
              <div className="sidebar-logo-sub">Personal Library</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="App sections">
          <button
            className={`sidebar-item${activeTab === 'library' || !isOwner ? ' active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'library' || !isOwner}
            onClick={() => setActiveTab('library')}
          >
            <span className="sidebar-item-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            <span className="sidebar-item-text">Library</span>
            {books.length > 0 && <span className="sidebar-badge">{books.length}</span>}
          </button>

          {isOwner && (
            <button
              className={`sidebar-item${activeTab === 'add' ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'add'}
              onClick={() => setActiveTab('add')}
            >
              <span className="sidebar-item-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              <span className="sidebar-item-text">Add Book</span>
            </button>
          )}

          {isOwner && (
            <button
              className={`sidebar-item${activeTab === 'recommendations' ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'recommendations'}
              onClick={() => setActiveTab('recommendations')}
            >
              <span className="sidebar-item-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </span>
              <span className="sidebar-item-text">Discover</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-item theme-toggle-btn"
            onClick={toggleDark}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ width: '100%' }}
          >
            <span className="sidebar-item-icon">
              {darkMode ? <SunSVG /> : <MoonSVG />}
            </span>
            <span className="sidebar-item-text">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            className={`sidebar-item${isOwner ? ' signed-in' : ''}`}
            onClick={handleAuthBtn}
            title={isOwner ? 'Sign out' : 'Owner sign in'}
            aria-label={isOwner ? 'Sign out' : 'Owner sign in'}
            style={{ width: '100%' }}
          >
            <span className="sidebar-item-icon">
              {isOwner ? <LockOpenSVG /> : <LockClosedSVG />}
            </span>
            <span className="sidebar-item-text">{isOwner ? 'Sign Out' : 'Sign In'}</span>
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div className="main-panel">
      <main className="main-content">

        {/* ── Library tab ── */}
        <div id="library" className={`tab-content${activeTab === 'library' || !isOwner ? ' active' : ''}`}>
          <div className="section-header">
            <h2 className="section-title">
              {selectedYear === 'all' ? 'All Books' : `${selectedYear}`}
            </h2>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="yearFilter" className="sr-only">Filter by year</label>
              <select id="yearFilter" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                <option value="all">All Years</option>
                {allYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="stats">
            <div className="stat-card">
              <div className="stat-number">{totalBooks}</div>
              <div className="stat-label">Books Read</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{avgRating}</div>
              <div className="stat-label">Avg Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-genre">{totalBooks > 0 ? favoriteGenre : '—'}</div>
              <div className="stat-label">Top Genre</div>
            </div>
          </div>

          {/* Book grid */}
          <div id="booksList" className="books-list" style={{ gridTemplateColumns: `repeat(${booksPerRow}, 1fr)` }}>
            {sortedBooks.length === 0 ? (
              <div className="empty-state">
                {selectedYear === 'all' ? (
                  <>
                    <h3>Your library is empty</h3>
                    <p>Start building your reading ledger — every great collection begins with a single book.</p>
                    {isOwner && (
                      <button className="empty-state-cta" onClick={() => setActiveTab('add')}>Log your first book</button>
                    )}
                  </>
                ) : (
                  <>
                    <h3>No books for {selectedYear}</h3>
                    <p>Nothing logged for this year. Select a different year or add a new entry.</p>
                  </>
                )}
              </div>
            ) : sortedBooks.map((book, index) => (
              <div key={book.id} style={{ display: 'contents' }}>
                <div
                  className="book-card"
                  data-book-id={book.id}
                  title={`${book.title}${book.author ? ' — ' + book.author : ''}`}
                  onClick={(e) => {
                    if (!e.target.closest('.book-menu') && !e.target.closest('.delete-btn-icon')) {
                      openDetail(book.id);
                    }
                  }}
                >
                  <div className="books__cover">
                    <div className="books__back-cover" />
                    <div className="books__inside">
                      <div className="books__page" />
                      <div className="books__page" />
                      <div className="books__page" />
                    </div>
                    <div className="books__image">
                      {book.coverImage
                        ? <img src={book.coverImage} alt={book.title} loading="lazy" />
                        : <div className="book-placeholder">📚</div>}
                      <div className="books__effect" />
                      <div className="books__light" />
                    </div>
                  </div>
                  <div className="book-contact-shadow" />
                  {isOwner && (
                    <>
                      <button
                        className="delete-btn-icon"
                        data-book-id={book.id}
                        title="Options"
                        aria-label="Options"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === book.id ? null : book.id);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
                        </svg>
                      </button>
                      <div className={`book-menu${openMenuId === book.id ? ' active' : ''}`} id={`menu-${book.id}`}>
                        <button className="book-menu-item edit-item" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); openDetailInEdit(book.id); }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 9.5-9.5z" /></svg>
                          Edit
                        </button>
                        <button className="book-menu-item delete-item" onClick={async (e) => { e.stopPropagation(); setOpenMenuId(null); await handleDeleteBook(book.id); }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {/* Continuous shelf after every full row, and after the last book */}
                {((index + 1) % booksPerRow === 0 || index === sortedBooks.length - 1) && (
                  <div className="shelf-line" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Add New tab ── */}
        {isOwner && (
          <div id="add" className={`tab-content${activeTab === 'add' ? ' active' : ''}`}>
            <h2 className="section-title" style={{ marginBottom: 28 }}>Log a Finished Book</h2>

            <div className="form-group">
              <label htmlFor="bookTitle">Book Title</label>
              <input
                type="text"
                id="bookTitle"
                value={addTitle}
                placeholder="Enter book title..."
                onChange={e => { setAddTitle(e.target.value); lookupBook(e.target.value); }}
              />
              {lookupStatus.text && (
                <div style={{ marginTop: 8, fontSize: '0.9em', color: lookupStatus.color }}>{lookupStatus.text}</div>
              )}
            </div>

            {showManual && (
              <div className="manual-entry-section">
                <div className="manual-entry-label">✦ Add Details Manually</div>
                <div className="form-group">
                  <label htmlFor="manualAuthor">Author</label>
                  <input type="text" id="manualAuthor" value={manualAuthor} placeholder="Enter author name..." onChange={e => setManualAuthor(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="manualGenre">Genre</label>
                  <select id="manualGenre" value={manualGenre} onChange={e => {
                    setManualGenre(e.target.value);
                    setShowCustomGenre(e.target.value === 'Other');
                    if (e.target.value !== 'Other') setCustomGenre('');
                  }}>
                    <option value="">Select a genre...</option>
                    {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
                    <option value="Other">Other (create new)</option>
                  </select>
                </div>
                {showCustomGenre && (
                  <div className="form-group">
                    <label htmlFor="customGenre">Create New Genre</label>
                    <input type="text" id="customGenre" value={customGenre} placeholder="Enter custom genre name..." onChange={e => setCustomGenre(e.target.value)} />
                    <div className="genre-hint">This genre will be added to the dropdown for future use</div>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="manualSynopsis">Synopsis (optional)</label>
                  <textarea id="manualSynopsis" rows={4} value={manualSynopsis} placeholder="Paste or write a brief synopsis..." onChange={e => setManualSynopsis(e.target.value)} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label id="ratingLabel">Your Rating</label>
              <RatingStars
                rating={addRating}
                hover={addRatingHover}
                onRate={setAddRating}
                onHover={setAddRatingHover}
                onLeave={() => setAddRatingHover(0)}
                className="star"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateFinished">Date Finished</label>
              <input type="date" id="dateFinished" value={addDate} onChange={e => setAddDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="bookCover">Book Cover (optional)</label>
              <div className="cover-upload">
                <div className="cover-preview" id="coverPreview">
                  {addCover ? <img src={addCover} alt="Cover preview" /> : '📚'}
                </div>
                <div style={{ flex: 1 }}>
                  <input type="file" id="bookCover" accept="image/png, image/jpeg, image/jpg"
                    onChange={e => handleCoverFile(e.target.files[0])} />
                  <div className="cover-hint">
                    Or press <kbd>Ctrl+V</kbd> / <kbd>⌘V</kbd> to paste from clipboard
                  </div>
                </div>
              </div>
            </div>

            <button type="button" onClick={handleAddBook}>Add to Library</button>
          </div>
        )}

        {/* ── Discover tab ── */}
        {isOwner && (
          <div id="recommendations" className={`tab-content${activeTab === 'recommendations' ? ' active' : ''}`}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>What Should I Read Next?</h2>
            <p className="recs-intro">Based on your reading history and tastes, Claude will suggest titles you're likely to love:</p>
            <button onClick={generateRecommendations} style={{ marginBottom: 28 }}>Generate Recommendations</button>
            <div id="recommendationsList" className="recommendations">
              {recsLoading && (
                <div className="loading-state">
                  <div className="loading-primary">Consulting the stacks...</div>
                  <div className="loading-secondary">Analyzing your reading history</div>
                </div>
              )}
              {recsError && (
                <div className="error-state">
                  <div className="error-primary">⚠ Couldn't generate recommendations</div>
                  <div className="error-secondary">Please try again in a moment</div>
                </div>
              )}
              {recs === null && !recsLoading && books.length === 0 && (
                <div className="empty-state">
                  <h3>Nothing to go on yet</h3>
                  <p>Log at least one book to your library and we'll find reads you'll love.</p>
                  <button className="empty-state-cta" onClick={() => setActiveTab('add')}>Log your first book</button>
                </div>
              )}
              {recs && recs.map((rec, i) => (
                <div key={i} className="recommendation-card">
                  <div className="rec-content">
                    <div className="rec-title">{rec.title}</div>
                    <div className="rec-meta">
                      <span>{rec.author}</span>
                      <span className="genre-badge">{rec.genre}</span>
                    </div>
                    <div className="rec-reason">{rec.reason}</div>
                    <a
                      className="goodreads-link"
                      href={`https://www.goodreads.com/search?q=${encodeURIComponent(rec.title + ' ' + rec.author)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Find on Goodreads →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      </div>

      {/* ── Book Detail Drawer ── */}
      {detailId && (
        <div
          className="book-detail-overlay active"
          id="bookDetailOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bdTitle"
          onClick={e => { if (e.target === e.currentTarget) closeDetail(); }}
        >
          <div className="book-detail-modal">

            {/* Sticky header with close button */}
            <div className="bd-drawer-header">
              <button className="book-detail-close" onClick={closeDetail} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="bd-drawer-body">

              {/* Cover row — cover image + meta beside it */}
              <div className={`bd-cover-row${detailMode === 'edit' ? ' editing' : ''}`}>
                <div className="bd-cover-wrap">
                  <div className="bd-cover" id="bdCoverEl">
                    {(detailEditCover !== undefined ? detailEditCover : detailBook?.coverImage)
                      ? <img src={detailEditCover !== undefined ? detailEditCover : detailBook.coverImage} alt={detailBook?.title} loading="lazy" />
                      : '📚'}
                  </div>
                  {detailMode === 'edit' && (
                    <>
                      <label className="bd-cover-edit-btn" htmlFor="bdCoverInput" title="Change cover">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                        Change
                      </label>
                      <input type="file" id="bdCoverInput" accept="image/png,image/jpeg,image/jpg" style={{ display: 'none' }}
                        onChange={e => { handleDetailEditCover(e.target.files[0]); e.target.value = ''; }} />
                    </>
                  )}
                </div>

                <div className="bd-cover-meta">
                  {detailMode === 'view' ? (
                    <>
                      <div className="bd-title" id="bdTitle">{detailBook?.title}</div>
                      <div className="bd-author">{detailBook?.author ? 'by ' + detailBook.author : ''}</div>
                      <div className="bd-genre-badge">{detailBook?.genre}</div>
                      <div className="bd-stars" role="img" aria-label={`Rating: ${detailBook?.rating} out of 5`}>
                        <Stars rating={detailBook?.rating ?? 0} />
                      </div>
                    </>
                  ) : (
                    <>
                      <input type="text" className="bd-edit-input bd-edit-title-input" aria-label="Title" placeholder="Book title..." value={detailEditTitle} onChange={e => setDetailEditTitle(e.target.value)} />
                      <input type="text" className="bd-edit-input" aria-label="Author" placeholder="Author..." value={detailEditAuthor} onChange={e => setDetailEditAuthor(e.target.value)} />
                      <select className="bd-edit-select" aria-label="Genre" value={detailEditGenre} onChange={e => setDetailEditGenre(e.target.value)}>
                        {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <div className="bd-stars" onMouseLeave={() => setDetailEditRatingHover(0)}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <button
                            key={i}
                            className={`bd-star-interactive${(detailEditRatingHover || detailEditRating) >= i ? ' active' : ''}`}
                            aria-label={`Rate ${i} out of 5`}
                            onClick={() => setDetailEditRating(i)}
                            onMouseEnter={() => setDetailEditRatingHover(i)}
                          >
                            {(detailEditRatingHover || detailEditRating) >= i ? <StarFillSVG /> : <StarEmptySVG />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* View mode: synopsis + metadata */}
              {detailMode === 'view' && (
                <>
                  <div className="bd-synopsis">{detailBook?.synopsis || 'No synopsis available.'}</div>
                  {(detailBook?.dateFinished || detailBook?.apiRating) && (
                    <div className="bd-meta-list">
                      {detailBook?.dateFinished && <span className="bd-meta">Finished on {formatDateDisplay(detailBook.dateFinished)}</span>}
                      {detailBook?.apiRating && <span className="bd-meta">Goodreads rating — {detailBook.apiRating}</span>}
                    </div>
                  )}
                </>
              )}

              {/* Edit mode: synopsis + date (cover-meta has title/author/genre/stars) */}
              {detailMode === 'edit' && (
                <>
                  <textarea className="bd-edit-textarea" aria-label="Synopsis" placeholder="Synopsis..." value={detailEditSynopsis} onChange={e => setDetailEditSynopsis(e.target.value)} />
                  <div className="bd-edit-date-wrap">
                    <label className="bd-edit-label" htmlFor="bdEditDate">Date Finished</label>
                    <input type="date" className="bd-edit-input" id="bdEditDate" style={{ width: 'auto' }} value={detailEditDate} onChange={e => setDetailEditDate(e.target.value)} />
                  </div>
                </>
              )}

            </div>

            {/* Sticky footer — CTAs always visible at bottom */}
            <div className="bd-drawer-footer">
              {detailMode === 'view' && isOwner && (
                <>
                  <button className="bd-btn bd-btn-delete" onClick={handleDeleteFromDetail}>Delete</button>
                  <button className="bd-btn bd-btn-edit" onClick={() => enterEditMode()}>Edit</button>
                </>
              )}
              {detailMode === 'edit' && (
                <>
                  <button className="bd-btn bd-btn-cancel" onClick={exitEditMode}>Cancel</button>
                  <button className="bd-btn bd-btn-save" onClick={saveDetailChanges}>Save Changes</button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Login Modal ── */}
      {showLogin && (
        <div
          className="login-overlay active"
          role="dialog"
          aria-modal="true"
          aria-labelledby="loginTitle"
          onClick={e => { if (e.target === e.currentTarget) closeLogin(); }}
        >
          <div className="login-modal">
            <div className="login-modal-title" id="loginTitle">Owner Sign In</div>
            {loginError && <div className="login-error">{loginError}</div>}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="loginPassword">Password</label>
              <input
                type="password"
                id="loginPassword"
                autoComplete="current-password"
                placeholder="••••••••"
                value={loginPwd}
                onChange={e => setLoginPwd(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLoginSubmit()}
                autoFocus
              />
            </div>
            <div className="login-modal-footer">
              <button type="button" className="cancel-btn" onClick={closeLogin}>Cancel</button>
              <button type="button" onClick={handleLoginSubmit}>Sign In</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Undo Toast ── */}
      <div className={`undo-toast${undoBook ? ' active' : ''}`} role="status" aria-live="polite">
        <span className="undo-toast-message">
          &ldquo;{undoBook?.title?.length > 30 ? undoBook.title.slice(0, 28) + '…' : undoBook?.title}&rdquo; deleted
        </span>
        <button className="undo-toast-btn" onClick={handleUndo}>Undo</button>
      </div>

      <p className="design-credit">
        Book animation design by{' '}
        <a href="https://codepen.io/filipz" target="_blank" rel="noopener noreferrer">Filip Zrnzevic</a>
      </p>

    </div>
  );
}
