# MyPWriter Component Design Specifications

## Design Philosophy

- **Calm focus**: Every element serves the writer. Remove what distracts.
- **Generous whitespace**: Content breathes. Padding is generous, never cramped.
- **Warm minimalism**: Inspired by Japanese aesthetics — subtle, not sterile.
- **Night-first**: Dark mode is primary. Warm tones reduce eye strain.

---

## Layout Wireframes

### 1. Home Dashboard (ホーム)

```
┌─────────────────────────────────────────────────┐
│  Logo/Title            [Settings]  [Theme]       │ ← Toolbar (h: 48px)
├─────────────────────────────────────────────────┤
│                                                  │
│  ようこそ、MyPWriter へ                          │ ← Greeting
│                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Project │ │ Project │ │ + 新規  │           │ ← Project Cards (grid)
│  │ Card 1  │ │ Card 2  │ │ 作成   │           │
│  │         │ │         │ │         │           │
│  │ 12章    │ │ 8章     │ │         │           │
│  │ 45,200字│ │ 22,100字│ │         │           │
│  └─────────┘ └─────────┘ └─────────┘           │
│                                                  │
│  執筆統計                                        │ ← Stats Section
│  ┌──────────────────────────────────┐           │
│  │  Heatmap (GitHub-style)          │           │
│  │  ■ ■ □ ■ ■ ■ □ ■ ■ ...         │           │
│  └──────────────────────────────────┘           │
│                                                  │
│  ┌──────────┐  ┌──────────┐                     │
│  │ 今週の   │  │ 連続記録 │                     │ ← Weekly Stats
│  │ 文字数   │  │ 15日     │                     │
│  │ 8,500字  │  │          │                     │
│  └──────────┘  └──────────┘                     │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Key specs:**
- Toolbar: 48px height, bg-secondary, border-bottom
- Content area: max-width 960px, centered, padding 32px
- Project cards: 3-column grid (min 240px), gap 16px
- Card: bg-elevated, radius-xl, padding 20px, shadow-sm on hover

### 2. Project Detail (プロジェクト詳細)

```
┌─────────────────────────────────────────────────┐
│  ← 戻る   Project Title        [Edit] [Delete]  │ ← Toolbar
├─────────────────────────────────────────────────┤
│                                                  │
│  Project Title (大きなタイトル)                   │
│  作成日: 2024/01/15  |  12章  |  45,200字        │ ← Metadata
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Progress Bar  ████████░░░░  65%         │   │ ← Progress
│  └──────────────────────────────────────────┘   │
│                                                  │
│  章一覧                                          │
│  ┌──────────────────────────────────────────┐   │
│  │ 1. 第一章「始まり」      3,200字  [Edit] │   │ ← Chapter List
│  │ 2. 第二章「出会い」      4,100字  [Edit] │   │
│  │ 3. 第三章「転換」        2,800字  [Edit] │   │
│  │ + 新しい章を追加                          │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  最近のAIチャット                                 │
│  ┌──────────────────────────────────────────┐   │
│  │ "プロット相談: 第三章の展開..."  3時間前  │   │
│  │ "キャラクター: 主人公の動機..."  昨日     │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Key specs:**
- Same toolbar pattern, with back navigation
- Content: max-width 720px, centered
- Chapter list items: full-width, border-bottom separators, 48px min-height
- Hover state: bg-hover, subtle transition

### 3. Editor (エディタ) — 3-Column Layout

```
┌────────────────────────────────────────────────────────────┐
│  ← Project   Chapter Title   字数: 3,200   [Save] [...]   │ ← Toolbar
├──────┬───────────────────────────────────┬─────────────────┤
│      │                                   │                 │
│ Ch.  │                                   │  AI Chat        │
│ List │        Writing Area               │  Panel          │
│      │                                   │                 │
│ 1 ■  │  　吾輩は猫である。名前は         │  ┌───────────┐ │
│ 2    │  まだない。                        │  │ Message   │ │
│ 3    │  　どこで生まれたかとんと          │  │ ...       │ │
│ 4    │  見当がつかぬ。何でも薄暗い        │  │           │ │
│ 5    │  じめじめした所でニャーニャー      │  │           │ │
│      │  泣いていた事だけは記憶して        │  └───────────┘ │
│      │  いる。                            │  ┌───────────┐ │
│      │                                   │  │ Input     │ │
│      │                                   │  │ [Send]    │ │
│      │                                   │  └───────────┘ │
├──────┴───────────────────────────────────┴─────────────────┤
│  Status: 自動保存済み 14:32  |  横書き  |  Noto Serif JP   │ ← Status bar
└────────────────────────────────────────────────────────────┘
```

**Key specs:**
- Left sidebar (chapter list): 200px width, collapsible, bg-secondary
- Editor area: flex-1, bg-primary, generous padding (48px+ horizontal, 32px vertical)
- AI panel: 320px width, collapsible, bg-secondary
- Editor font: var(--font-editor), line-height 1.8
- Status bar: 28px height, font-size xs, bg-secondary
- Toolbar: 48px, includes chapter title (editable), character count
- Text area: no border, no background change — pure writing surface

**Vertical writing variant:**
```
┌──────────────────────────────────────────────┐
│  Toolbar                                      │
├──────┬───────────────────────────┬───────────┤
│ Ch.  │  ←←←←← reading direction │ AI Panel  │
│ List │  │吾│ど│何│じ│泣│        │           │
│      │  │輩│こ│で│め│い│        │           │
│      │  │は│で│も│じ│て│        │           │
│      │  │猫│生│薄│め│い│        │           │
│      │  │で│ま│暗│し│た│        │           │
│      │  │あ│れ│い│た│事│        │           │
│      │  │る│た│　│所│だ│        │           │
│      │  │。│か│　│で│け│        │           │
│      │  │　│と│　│　│は│        │           │
├──────┴───────────────────────────┴───────────┤
│  Status bar                                   │
└──────────────────────────────────────────────┘
```

### 4. Settings (設定)

```
┌─────────────────────────────────────────────────┐
│  ← 戻る   設定                                   │ ← Toolbar
├───────────┬─────────────────────────────────────┤
│           │                                      │
│ Nav       │  エディタ設定                         │ ← Section title
│           │                                      │
│ ■ エディタ│  フォント                             │
│   表示    │  ┌──────────────────────────────┐   │
│   AI      │  │ Noto Serif JP           ▼   │   │ ← Dropdown
│   プロンプト│  └──────────────────────────────┘   │
│   一般    │                                      │
│           │  文字サイズ                           │
│           │  ○ 小 ● 中 ○ 大 ○ 特大              │ ← Radio group
│           │                                      │
│           │  行間                                 │
│           │  ──────●──────────  1.8              │ ← Slider
│           │                                      │
│           │  デフォルト書字方向                    │
│           │  [横書き] [縦書き]                    │ ← Toggle group
│           │                                      │
│           │  テーマ                               │
│           │  [ダーク] [ライト]                    │ ← Toggle group
│           │                                      │
└───────────┴─────────────────────────────────────┘
```

**Key specs:**
- Left nav: 200px, bg-secondary, padding 16px
- Content: max-width 560px, padding 32px
- Section spacing: 32px between sections
- Input/control spacing: 24px between controls, 8px label-to-control

---

## Component Patterns

### Buttons

| Variant   | Background        | Text          | Border        | Use case           |
|-----------|-------------------|---------------|---------------|--------------------|
| primary   | accent-primary    | text-inverse  | none          | Main actions       |
| secondary | bg-elevated       | text-primary  | border-default| Secondary actions  |
| ghost     | transparent       | text-secondary| none          | Tertiary/toolbar   |
| danger    | error-bg          | error         | none          | Destructive        |

**Sizes:**
- sm: h-28px, px-10px, text-sm
- md: h-32px, px-14px, text-base (default)
- lg: h-40px, px-20px, text-md

**States:** hover (lighten/darken), active (press), disabled (0.5 opacity), focus-visible (ring)

### Cards

- Background: var(--bg-elevated)
- Border: 1px solid var(--border-subtle)
- Radius: var(--radius-xl) = 12px
- Padding: 20px
- Shadow: none at rest, shadow-sm on hover
- Transition: shadow + border-color, 200ms

### Inputs

- Height: 36px (single line)
- Background: var(--bg-tertiary)
- Border: 1px solid var(--border-default)
- Radius: var(--radius-md) = 6px
- Padding: 0 12px
- Focus: border-color: accent, shadow ring
- Placeholder: text-tertiary

### Panels (Sidebar, AI Chat)

- Background: var(--bg-secondary)
- Border: 1px solid var(--border-subtle) on the dividing edge
- Width: defined by layout (200px sidebar, 320px AI panel)
- Collapsible with smooth width transition (300ms)
- Header: 48px, flex, align-center, border-bottom

### Modals

- Overlay: var(--bg-overlay), fade in 200ms
- Container: bg-elevated, radius-2xl, shadow-xl, max-width 480px
- Padding: 24px
- Header: title (heading-md) + close button (ghost)
- Footer: right-aligned buttons, gap 8px
- Animation: scale(0.96) → scale(1) + fade, 200ms ease-out

### Toolbar

- Height: 48px
- Background: var(--bg-secondary)
- Border-bottom: 1px solid var(--border-subtle)
- Items: flex, align-center, gap 8px
- Padding: 0 16px
- Buttons inside: ghost variant

---

## Icon Guidelines

- **Library**: Lucide React (lucide-react)
- **Style**: Outline/stroke only (not filled)
- **Size**: 16px for inline/toolbar, 20px for standalone, 24px for large
- **Stroke width**: 1.5px (default Lucide)
- **Color**: currentColor (inherits text color)
- **Common icons**:
  - Navigation: ChevronLeft, ChevronRight, Home, Settings, ArrowLeft
  - Actions: Plus, Trash2, Edit3, Save, Copy, Download
  - Editor: AlignLeft, AlignJustify, Type, BookOpen
  - AI: MessageSquare, Sparkles, Bot, Send
  - Status: Check, X, AlertCircle, Info
  - Files: FileText, FolderOpen, File

---

## Spacing & Alignment Rules

1. **Base unit**: 4px. All spacing should be multiples of 4.
2. **Content padding**:
   - Page content: 32px horizontal, 24px vertical
   - Cards/panels: 20px
   - Compact areas (toolbar items, list items): 8-12px
3. **Element gaps**:
   - Between sections: 32px
   - Between related items: 16px
   - Between label and control: 8px
   - Between inline items: 8px
4. **Alignment**: Left-aligned by default. Center only for modals and empty states.
5. **Max content width**:
   - Dashboard: 960px
   - Detail pages: 720px
   - Settings content: 560px
   - Editor: full width (no max)

---

## Accessibility Requirements

- **Contrast ratios**: All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- **Focus indicators**: Visible on keyboard navigation (focus-visible)
- **ARIA labels**: All icon-only buttons must have aria-label
- **Reduced motion**: Respect prefers-reduced-motion media query
- **Font sizing**: Use rem units, respect user's browser font size
- **Touch targets**: Minimum 32px for interactive elements
