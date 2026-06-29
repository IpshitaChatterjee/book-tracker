'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import AddBookDrawer from './AddBookDrawer';
import { supabase, OWNER_UUID } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { AddBookButton } from '@/components/ui/AddBookButton';
import { StatCard } from '@/components/ui/StatCard';
import { GenreBadge } from '@/components/ui/GenreBadge';
import { CoverPlaceholder } from '@/components/ui/CoverPlaceholder';
import { StarRatingInput } from '@/components/ui/StarRatingInput';

function useFocusTrap(active) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    const sel = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    function onKeyDown(e) {
      if (e.key !== 'Tab') return;
      const nodes = [...el.querySelectorAll(sel)];
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [active]);
  return ref;
}

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

export default function TBRTracker() {
  const [darkMode, setDarkMode] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [booksPerRow, setBooksPerRow] = useState(6);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [detailBook, setDetailBook] = useState(null);
  const [completingBook, setCompletingBook] = useState(null);
  const [completingRating, setCompletingRating] = useState(0);
  const [completingRatingHover, setCompletingRatingHover] = useState(0);
  const [completingDate, setCompletingDate] = useState('');
  const [isCompletingBook, setIsCompletingBook] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, title }
  const [isDeleting, setIsDeleting] = useState(false);
  const [undoBook, setUndoBook] = useState(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const undoTimerRef = useRef(null);
  const deletedCacheRef = useRef(null);

  const detailTrapRef = useFocusTrap(!!detailBook);
  const completeTrapRef = useFocusTrap(!!completingBook);
  const deleteTrapRef = useFocusTrap(!!confirmDelete);
  const gsapTimelinesRef = useRef([]);

  useEffect(() => {
    const saved = localStorage.getItem('rt_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (saved === null && prefersDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    setIsOwner(localStorage.getItem('bt_owner') === '1');
    loadBooks();
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (!e.target.closest('.book-menu') && !e.target.closest('.delete-btn-icon')) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

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

  useEffect(() => {
    return () => clearTimeout(undoTimerRef.current);
  }, []);

  useLayoutEffect(() => {
    gsapTimelinesRef.current.forEach(({ tl, card, onEnter, onLeave }) => {
      tl.kill();
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
    });
    gsapTimelinesRef.current = [];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.tbr-book-card[data-book-id]');
    cards.forEach(card => {
      const image  = card.querySelector('.books__image');
      const effect = card.querySelector('.books__effect');
      const light  = card.querySelector('.books__light');
      const pages  = card.querySelectorAll('.books__page');
      const shadow = card.querySelector('.book-contact-shadow');
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
  }, [books]);

  async function loadBooks() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tbr_books')
        .select('*')
        .eq('user_id', OWNER_UUID)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBooks(data.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author || '',
        genre: b.genre || '',
        rating: b.rating || 0,
        coverImage: b.cover_image || null,
        synopsis: b.synopsis || '',
        createdAt: b.created_at || null,
      })));
    } catch (err) {
      console.error('Error loading TBR books:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(book) {
    try {
      const { data, error } = await supabase
        .from('tbr_books')
        .insert([{
          user_id: OWNER_UUID,
          title: book.title,
          author: book.author,
          genre: book.genre,
          rating: book.rating || null,
          cover_image: book.coverImage,
          synopsis: book.synopsis,
        }])
        .select();
      if (error) throw error;
      const b = data[0];
      setBooks(prev => [{
        id: b.id,
        title: b.title,
        author: b.author || '',
        genre: b.genre || '',
        rating: b.rating || 0,
        coverImage: b.cover_image || null,
        synopsis: b.synopsis || '',
        createdAt: b.created_at || null,
      }, ...prev]);
    } catch (err) {
      console.error('Error saving TBR book:', err);
    } finally {
      setShowDrawer(false);
    }
  }

  async function handleDelete(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    deletedCacheRef.current = { ...book };
    setBooks(prev => prev.filter(b => b.id !== id));
    showUndo(deletedCacheRef.current);
    const { error } = await supabase.from('tbr_books').delete().eq('id', id);
    if (error) {
      clearTimeout(undoTimerRef.current);
      setUndoBook(null);
      deletedCacheRef.current = null;
      setBooks(prev => [book, ...prev.filter(b => b.id !== book.id)]);
      setDeleteError('Could not delete. Please try again.');
      undoTimerRef.current = setTimeout(() => setDeleteError(null), 4000);
    }
  }

  async function confirmDeleteBook() {
    if (!confirmDelete || isDeleting) return;
    setIsDeleting(true);
    const pending = confirmDelete;
    try {
      await handleDelete(pending.id);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  }

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
    if (!book || isUndoing) return;
    setIsUndoing(true);
    clearTimeout(undoTimerRef.current);
    setUndoBook(null);
    deletedCacheRef.current = null;
    try {
      const { data, error } = await supabase
        .from('tbr_books')
        .insert([{
          user_id: OWNER_UUID,
          title: book.title,
          author: book.author,
          genre: book.genre,
          rating: book.rating || null,
          cover_image: book.coverImage,
          synopsis: book.synopsis,
        }])
        .select();
      if (error) throw error;
      setBooks(prev => [{ ...book, id: data[0].id }, ...prev]);
    } catch (err) {
      console.error('Failed to undo delete:', err);
    } finally {
      setIsUndoing(false);
    }
  }

  function openCompleteModal(book) {
    setCompletingBook(book);
    setCompletingRating(0);
    setCompletingRatingHover(0);
    setCompletingDate(new Date().toISOString().split('T')[0]);
  }

  async function handleConfirmComplete() {
    if (!completingBook || isCompletingBook) return;
    const book = completingBook;
    setIsCompletingBook(true);
    try {
      setBooks(prev => prev.filter(b => b.id !== book.id));
      await supabase.from('books').insert([{
        user_id: OWNER_UUID,
        title: book.title,
        author: book.author,
        genre: book.genre,
        rating: completingRating || null,
        date_finished: completingDate,
        cover_image: book.coverImage,
        synopsis: book.synopsis,
      }]);
      await supabase.from('tbr_books').delete().eq('id', book.id);
      setCompletingBook(null);
    } finally {
      setIsCompletingBook(false);
    }
  }

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('rt_theme', next ? 'dark' : 'light');
  }

  const allGenres = [...new Set(books.map(b => b.genre).filter(Boolean))];

  const genreCounts = {};
  books.forEach(b => { if (b.genre) genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1; });
  const topGenre = Object.keys(genreCounts).length > 0
    ? Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b)
    : '—';

  const now = new Date();
  const addedThisMonth = books.filter(b => {
    if (!b.createdAt) return false;
    const d = new Date(b.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

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
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="App sections">
          <Link href="/" className="sidebar-item">
            <span className="sidebar-item-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </span>
            <span className="sidebar-item-text">Completed</span>
          </Link>

          <a href="/tbr" className="sidebar-item active">
            <span className="sidebar-item-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </span>
            <span className="sidebar-item-text">To Be Read</span>
          </a>

          {isOwner && (
            <Link href="/?tab=recommendations" className="sidebar-item">
              <span className="sidebar-item-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </span>
              <span className="sidebar-item-text">Discover</span>
            </Link>
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
          <Link href="/" className={`sidebar-item${isOwner ? ' signed-in' : ''}`}>
            <span className="sidebar-item-icon">
              {isOwner ? <LockOpenSVG /> : <LockClosedSVG />}
            </span>
            <span className="sidebar-item-text">{isOwner ? 'Sign Out' : 'Sign In'}</span>
          </Link>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div className="main-panel">
        <main className="main-content">
          <div className="section-header">
            <h2 className="section-title">To Be Read</h2>
            {isOwner && (
              <AddBookButton onClick={() => setShowDrawer(true)} />
            )}
          </div>

          {/* Stats */}
          {!isLoading && books.length > 0 && (
            <div className="stats">
              <StatCard value={books.length} label="Books TBR" />
              <StatCard value={addedThisMonth} label="Added This Month" />
              <StatCard value={topGenre} label="Top Genre" isGenre />
            </div>
          )}

          {isLoading ? (
            <div className="loading-fullpage">
              <div className="page-spinner" aria-label="Loading" />
              <p className="loading-label">Turning pages…</p>
            </div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <h3>Your reading list is empty</h3>
              <p>Books you want to read next will appear here.</p>
              {isOwner && (
                <AddBookButton className="empty-state-cta" onClick={() => setShowDrawer(true)} />
              )}
            </div>
          ) : (
            <div className="books-list" style={{ gridTemplateColumns: `repeat(${booksPerRow}, 1fr)` }}>
              {books.map((book, index) => (
                <div key={book.id} style={{ display: 'contents' }}>
                  <div
                    className="book-card tbr-book-card"
                    data-book-id={book.id}
                  >
                    <button
                      type="button"
                      className="book-card-select-btn"
                      aria-label={`View details for ${book.title}${book.author ? ' by ' + book.author : ''}`}
                      onClick={() => setDetailBook(book)}
                    />
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
                          : <div className="book-placeholder"><CoverPlaceholder /></div>}
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
                          title={`Options for ${book.title}`}
                          aria-label={`Options for ${book.title}`}
                          onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === book.id ? null : book.id); }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
                          </svg>
                        </button>
                        <div className={`book-menu${openMenuId === book.id ? ' active' : ''}`}>
                          <button className="book-menu-item edit-item" onClick={e => { e.stopPropagation(); setOpenMenuId(null); openCompleteModal(book); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            Completed
                          </button>
                          <button className="book-menu-item delete-item" onClick={e => { e.stopPropagation(); setOpenMenuId(null); setConfirmDelete({ id: book.id, title: book.title }); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  {((index + 1) % booksPerRow === 0 || index === books.length - 1) && (
                    <div className="shelf-line" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          )}

          <AddBookDrawer
            open={showDrawer}
            onClose={() => setShowDrawer(false)}
            onSave={handleSave}
            title="Add Book"
            submitLabel="Add Book"
            showDateFinished={false}
            showRating={false}
            existingGenres={allGenres}
          />
        </main>
      </div>

      {/* ── Book detail drawer ── */}
      {detailBook && (
        <div
          className="book-detail-overlay active"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tbrDetailTitle"
          onClick={e => { if (e.target === e.currentTarget) setDetailBook(null); }}
          onKeyDown={e => { if (e.key === 'Escape') setDetailBook(null); }}
          tabIndex={-1}
        >
          <div className="book-detail-modal" ref={detailTrapRef}>
            <div className="bd-drawer-header">
              <span className="bd-drawer-title" id="tbrDetailTitle">Book Details</span>
              <button className="book-detail-close" onClick={() => setDetailBook(null)} aria-label="Close" autoFocus>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="bd-drawer-body bd-drawer-body--gap-lg">
              <div className="bd-centered-layout">
                <div className="bd-cover-lg">
                  {detailBook.coverImage
                    ? <img src={detailBook.coverImage} alt={detailBook.title} />
                    : <CoverPlaceholder />}
                </div>
                <div className="bd-title">{detailBook.title}</div>
                {detailBook.author && <div className="bd-author">by {detailBook.author}</div>}
                <GenreBadge genre={detailBook.genre} />
              </div>
              {detailBook.synopsis && (
                <p className="bd-synopsis">{detailBook.synopsis}</p>
              )}
            </div>
            {isOwner && (
              <div className="bd-drawer-footer">
                <Button variant="cancel" onClick={() => setDetailBook(null)}>Close</Button>
                <Button variant="save" onClick={() => { setDetailBook(null); openCompleteModal(detailBook); }}>Mark as Completed</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mark as Completed modal ── */}
      {completingBook && (
        <div
          className="book-detail-overlay active"
          role="dialog"
          aria-modal="true"
          aria-labelledby="completeModalTitle"
          onClick={e => { if (e.target === e.currentTarget && !isCompletingBook) setCompletingBook(null); }}
          onKeyDown={e => { if (e.key === 'Escape' && !isCompletingBook) setCompletingBook(null); }}
          tabIndex={-1}
        >
          <div className="book-detail-modal" ref={completeTrapRef}>
            <div className="bd-drawer-header">
              <span className="bd-drawer-title" id="completeModalTitle">Mark as Completed</span>
              <button className="book-detail-close" onClick={() => setCompletingBook(null)} aria-label="Close" disabled={isCompletingBook}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="bd-drawer-body bd-drawer-body--gap-lg">
              <div className="bd-centered-layout">
                <div className="bd-cover-lg">
                  {completingBook.coverImage
                    ? <img src={completingBook.coverImage} alt={completingBook.title} />
                    : <CoverPlaceholder />}
                </div>
                <div className="bd-title">{completingBook.title}</div>
                {completingBook.author && <div className="bd-author">by {completingBook.author}</div>}
                <GenreBadge genre={completingBook.genre} />
                <StarRatingInput
                  rating={completingRating}
                  hover={completingRatingHover}
                  onRate={setCompletingRating}
                  onHover={setCompletingRatingHover}
                  onLeave={() => setCompletingRatingHover(0)}
                />
                <div className="bd-edit-date-wrap">
                  <label className="bd-edit-label" htmlFor="completingDate">Date finished</label>
                  <input type="date" className="bd-edit-input" id="completingDate"
                    style={{ width: 'auto' }} value={completingDate}
                    onChange={e => setCompletingDate(e.target.value)} />
                </div>
              </div>
              {completingBook.synopsis && (
                <p className="bd-synopsis">{completingBook.synopsis}</p>
              )}
            </div>
            <div className="bd-drawer-footer">
              <Button variant="cancel" disabled={isCompletingBook} onClick={() => setCompletingBook(null)}>Cancel</Button>
              <Button variant="save" loading={isCompletingBook} onClick={handleConfirmComplete}>Move to Completed</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {confirmDelete && (
        <div
          className="login-overlay active"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmDeleteTitle"
          onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}
          onKeyDown={e => { if (e.key === 'Escape' && !isDeleting) setConfirmDelete(null); }}
          tabIndex={-1}
        >
          <div className="login-modal" ref={deleteTrapRef}>
            <div className="bd-drawer-title" id="confirmDeleteTitle">Delete this book?</div>
            <p className="bd-synopsis bd-synopsis--muted">
              {confirmDelete.title} will be removed from your reading list.
            </p>
            <div className="login-modal-footer">
              <Button variant="cancel" disabled={isDeleting} onClick={() => setConfirmDelete(null)} autoFocus>Cancel</Button>
              <Button variant="destructive" loading={isDeleting} onClick={confirmDeleteBook}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Undo Toast ── */}
      <div className={`undo-toast${undoBook ? ' active' : ''}`} role="status" aria-live="polite">
        <span className="undo-toast-message">
          &ldquo;{undoBook?.title?.length > 30 ? undoBook.title.slice(0, 28) + '…' : undoBook?.title}&rdquo; deleted
        </span>
        <button className="undo-toast-btn" onClick={handleUndo} disabled={isUndoing || isDeleting}>
          {isUndoing && <span className="btn-spinner" aria-hidden="true" />}
          {isUndoing ? 'Restoring…' : 'Undo'}
        </button>
      </div>

      {deleteError && (
        <div className="error-toast" role="alert">{deleteError}</div>
      )}

    </div>
  );
}
