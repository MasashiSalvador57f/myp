import { useEditorStore } from '@/stores/editorStore';
import { Button } from '@/components/ui';

const FONT_OPTIONS = [
  { label: '明朝体', value: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif' },
  { label: 'ゴシック体', value: '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif' },
];

const FONT_SIZE_OPTIONS = [14, 16, 18, 20, 24];

export function EditorToolbar() {
  const {
    direction,
    toggleDirection,
    charsPerLine,
    setCharsPerLine,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    isDirty,
  } = useEditorStore();

  const isVertical = direction === 'vertical';

  return (
    <header
      className={[
        'flex items-center h-12 px-4 bg-[var(--bg-secondary)]',
        'border-b border-b-[var(--border-subtle)] shrink-0',
        'select-none gap-2',
      ].join(' ')}
    >
      {/* Writing direction toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDirection}
        title={isVertical ? '横書きに切替' : '縦書きに切替'}
      >
        {isVertical ? (
          <span className="flex items-center gap-1">
            <VerticalIcon />
            <span className="text-xs">縦書き</span>
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <HorizontalIcon />
            <span className="text-xs">横書き</span>
          </span>
        )}
      </Button>

      <Divider />

      {/* Characters per line */}
      <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <span>字/行</span>
        <input
          type="number"
          min={10}
          max={80}
          value={charsPerLine}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 10 && v <= 80) setCharsPerLine(v);
          }}
          className={[
            'w-14 h-7 px-2 text-xs text-center rounded-[var(--radius-md)]',
            'bg-[var(--bg-tertiary)] border border-[var(--border-default)]',
            'text-[var(--text-primary)]',
            'focus:outline-none focus:border-[var(--border-focus)]',
          ].join(' ')}
        />
      </label>

      <Divider />

      {/* Font selector */}
      <select
        value={fontFamily}
        onChange={(e) => setFontFamily(e.target.value)}
        className={[
          'h-7 px-2 text-xs rounded-[var(--radius-md)]',
          'bg-[var(--bg-tertiary)] border border-[var(--border-default)]',
          'text-[var(--text-primary)]',
          'focus:outline-none focus:border-[var(--border-focus)]',
        ].join(' ')}
      >
        {FONT_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Font size */}
      <select
        value={fontSize}
        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
        className={[
          'h-7 px-2 text-xs rounded-[var(--radius-md)]',
          'bg-[var(--bg-tertiary)] border border-[var(--border-default)]',
          'text-[var(--text-primary)]',
          'focus:outline-none focus:border-[var(--border-focus)]',
        ].join(' ')}
      >
        {FONT_SIZE_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}px
          </option>
        ))}
      </select>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Dirty indicator */}
      {isDirty && (
        <span className="text-xs text-[var(--warning)]">未保存</span>
      )}
    </header>
  );
}

function Divider() {
  return (
    <div
      className="w-px h-5 bg-[var(--border-default)] mx-1"
      role="separator"
      aria-orientation="vertical"
    />
  );
}

function VerticalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="10" y1="2" x2="10" y2="12" />
      <line x1="7" y1="2" x2="7" y2="12" />
      <line x1="4" y1="2" x2="4" y2="8" />
    </svg>
  );
}

function HorizontalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="4" x2="12" y2="4" />
      <line x1="2" y1="7" x2="12" y2="7" />
      <line x1="2" y1="10" x2="8" y2="10" />
    </svg>
  );
}
