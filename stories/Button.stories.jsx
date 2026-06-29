import React from 'react';
import { Button } from '../components/ui/Button';

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
  '--red':        '#C03535',
  '--red-subtle': 'rgba(192,53,53,0.08)',
  '--emerald':    '#3E6B50',
  '--shadow-xs':  '0 1px 2px rgba(60,40,0,0.06)',
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
  '--red':        '#E05555',
  '--red-subtle': 'rgba(224,85,85,0.10)',
  '--emerald':    '#5DB87A',
  '--shadow-xs':  '0 1px 2px rgba(0,0,0,0.35)',
  '--shadow-sm':  '0 1px 3px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.25)',
};

// Simulate pseudo-states as static CSS classes so they can be shown in a grid.
// Triple-class specificity beats the existing single-class :hover/:active rules.
const FORCE_CSS = `
  .bd-btn.s-hover.bd-btn-save,
  .bd-btn.s-hover.bd-btn-edit   { opacity: 0.88; box-shadow: var(--shadow-sm); }
  .bd-btn.s-hover.bd-btn-cancel { background: var(--surface-2); box-shadow: none; }
  .bd-btn.s-hover.bd-btn-delete { background: var(--red-subtle); color: var(--red); border-color: rgba(192,53,53,0.25); box-shadow: none; }
  .bd-btn.s-pressed             { transform: scale(0.96); }
  .bd-btn.s-focused             { outline: 2px solid var(--emerald); outline-offset: 2px; }
`;

const VARIANTS = [
  { id: 'save',   label: 'Save Changes' },
  { id: 'cancel', label: 'Cancel' },
  { id: 'edit',   label: 'Edit' },
  { id: 'delete', label: 'Delete' },
];

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

function ThemePanel({ vars, name }) {
  return (
    <div style={{
      ...vars,
      background: 'var(--bg)',
      color: 'var(--text)',
      borderRadius: 12,
      padding: 28,
      flex: '1 1 340px',
      minWidth: 0,
    }}>
      <h3 style={{ ...LABEL_STYLE, marginBottom: 20 }}>{name}</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '76px max-content max-content max-content max-content',
        columnGap: 14,
        rowGap: 10,
        alignItems: 'center',
      }}>
        {/* Header row */}
        <div />
        {VARIANTS.map(v => (
          <div key={v.id} style={LABEL_STYLE}>{v.id}</div>
        ))}

        {/* State rows */}
        {STATES.map(state => (
          <React.Fragment key={state.key}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {state.label}
            </div>
            {VARIANTS.map(v => (
              <button
                key={`${state.key}-${v.id}`}
                type="button"
                className={`bd-btn bd-btn-${v.id}${state.cls ? ' ' + state.cls : ''}`}
                disabled={state.disabled || undefined}
              >
                {v.label}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['save', 'cancel', 'edit', 'delete'],
      description: 'Visual style variant',
    },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
};

// ── Individual stories (interactive, use the toolbar to switch themes) ────────

export const Save   = { args: { variant: 'save',   children: 'Save Changes' } };
export const Cancel = { args: { variant: 'cancel', children: 'Cancel' } };
export const Edit   = { args: { variant: 'edit',   children: 'Edit' } };
export const Delete = { args: { variant: 'delete', children: 'Delete' } };
export const Disabled = {
  args: { variant: 'save', children: 'Save Changes', disabled: true },
};

// ── State matrix: all variants × all states × both themes ────────────────────

export const AllStates = {
  name: 'All States — Light & Dark',
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      <style>{FORCE_CSS}</style>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <ThemePanel vars={LIGHT} name="Light — Moonlit Parchment" />
        <ThemePanel vars={DARK}  name="Dark — Enchanted Forest" />
      </div>
    </>
  ),
};
