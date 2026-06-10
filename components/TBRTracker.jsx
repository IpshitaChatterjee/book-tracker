'use client';

import { useState, useEffect } from 'react';
import AddBookDrawer from './AddBookDrawer';
import { supabase, OWNER_UUID } from '@/lib/supabase';

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
      }, ...prev]);
    } catch (err) {
      console.error('Error saving TBR book:', err);
    } finally {
      setShowDrawer(false);
    }
  }

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('rt_theme', next ? 'dark' : 'light');
  }

  const allGenres = [...new Set(books.map(b => b.genre).filter(Boolean))];

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
          <a href="/" className="sidebar-item">
            <span className="sidebar-item-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            <span className="sidebar-item-text">Completed</span>
          </a>

          <a href="/tbr" className="sidebar-item active">
            <span className="sidebar-item-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </span>
            <span className="sidebar-item-text">To Be Read</span>
          </a>

          {isOwner && (
            <a href="/?tab=recommendations" className="sidebar-item">
              <span className="sidebar-item-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </span>
              <span className="sidebar-item-text">Discover</span>
            </a>
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
          <a href="/" className={`sidebar-item${isOwner ? ' signed-in' : ''}`}>
            <span className="sidebar-item-icon">
              {isOwner ? <LockOpenSVG /> : <LockClosedSVG />}
            </span>
            <span className="sidebar-item-text">{isOwner ? 'Sign Out' : 'Sign In'}</span>
          </a>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div className="main-panel">
        <main className="main-content">
          <div className="section-header">
            <h2 className="section-title">To Be Read</h2>
            {isOwner && (
              <button className="add-book-cta" onClick={() => setShowDrawer(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Book
              </button>
            )}
          </div>

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
                <button className="add-book-cta" style={{ marginTop: 8 }} onClick={() => setShowDrawer(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Book
                </button>
              )}
            </div>
          ) : (
            <div className="tbr-list">
              {books.map(book => (
                <div key={book.id} className="tbr-card">
                  <div className="tbr-cover">
                    {book.coverImage
                      ? <img src={book.coverImage} alt={book.title} />
                      : <span>📚</span>}
                  </div>
                  <div className="tbr-meta">
                    <div className="tbr-title">{book.title}</div>
                    {book.author && <div className="tbr-author">by {book.author}</div>}
                    {book.genre && <span className="genre-badge">{book.genre}</span>}
                    {book.synopsis && <p className="tbr-synopsis">{book.synopsis}</p>}
                  </div>
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

    </div>
  );
}
