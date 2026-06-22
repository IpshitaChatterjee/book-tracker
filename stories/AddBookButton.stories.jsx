import React from 'react';
import { AddBookButton } from '../components/ui/AddBookButton';

// Pin exact token values for each theme so both panels render correctly
// regardless of the toolbar's light/dark toggle.
const LIGHT = {
  '--bg':         '#F8F4EC',
  '--surface':    '#FDFAF3',
  '--surface-2':  '#F5F0E6',
  '--border':     '#DDD5C0',
  '--text':       '#211C14',
  '--text-muted': '#6B5E48',
  '--primary':    '#1A2D1E',
  '--primary-fg': '#F2EEE4',
  '--emerald':    '#3E6B50',
  '--shadow-sm':  '0 1px 3px rgba(60,40,0,0.10), 0 1px 2px rgba(60,40,0,0.06)',
};

const DARK = {
  '--bg':         '#0E1610',
  '--surface':    '#141E16',
  '--surface-2':  '#111A13',
  '--border':     '#233328',
  '--text':       '#D8EDCC',
  '--text-muted': '#7CA87A',
  '--primary':    '#B8DBA8',
  '--primary-fg': '#0E1610',
  '--emerald':    '#5DB87A',
  '--shadow-sm':  '0 1px 3px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.25)',
};

// Simulate pseudo-states as static CSS classes so they can be shown in a grid.
// Hover's brightness direction differs by theme (darken on light, lighten on
// dark) just like the real `html.dark .add-book-cta:hover` rule in globals.css.
const FORCE_CSS = `
  .theme-light .add-book-cta.s-hover { filter: brightness(0.85); box-shadow: var(--shadow-sm); transform: translateY(-1px); }
  .theme-dark  .add-book-cta.s-hover { filter: brightness(1.12); box-shadow: var(--shadow-sm); transform: translateY(-1px); }
  .add-book-cta.s-pressed { transform: scale(0.96); }
  .add-book-cta.s-focused { outline: 2px solid var(--emerald); outline-offset: 2px; }
`;

const STATES = [
  { key: 'default',  label: 'Default',  cls: '' },
  { key: 'hover',    label: 'Hover',    cls: 's-hover' },
  { key: 'pressed',  label: 'Pressed',  cls: 's-pressed' },
  { key: 'focused',  label: 'Focused',  cls: 's-focused' },
  { key: 'disabled', label: 'Disabled', cls: '', disabled: true },
];

const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};

function ThemePanel({ vars, name, themeClass }) {
  return (
    <div className={themeClass} style={{
      ...vars,
      background: 'var(--bg)',
      color: 'var(--text)',
      borderRadius: 12,
      padding: 28,
      flex: '1 1 260px',
      minWidth: 0,
    }}>
      <h3 style={{ ...LABEL_STYLE, marginBottom: 20 }}>{name}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {STATES.map(state => (
          <div key={state.key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', width: 64 }}>{state.label}</div>
            <AddBookButton
              className={state.cls}
              disabled={state.disabled || undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  title: 'UI/AddBookButton',
  component: AddBookButton,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

// ── Individual stories (interactive, use the toolbar to switch themes) ────────

export const Default = { args: { children: 'Add Book' } };
export const Disabled = { args: { children: 'Add Book', disabled: true } };

// ── State matrix: default × hover × pressed × focused × disabled, both themes ─

export const AllStates = {
  name: 'All States — Light & Dark',
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      <style>{FORCE_CSS}</style>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <ThemePanel vars={LIGHT} name="Light — Moonlit Parchment" themeClass="theme-light" />
        <ThemePanel vars={DARK}  name="Dark — Enchanted Forest" themeClass="theme-dark" />
      </div>
    </>
  ),
};
