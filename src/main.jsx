import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Moveable from 'react-moveable';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertImage,
  InsertTable,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  GripVertical,
  LayoutGrid,
  Plus,
  Settings,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@mdxeditor/editor/style.css';
import './styles.css';
import { defaultContentItems, defaultSections } from './siteData';

const CONSOLE_PASSWORD = 'password';
const SETTINGS_KEY = 'my-web-template-settings';
const CONSOLE_SESSION_KEY = 'my-web-console-unlocked';
const LAYOUT_ROW_HEIGHT = 32;
const DEFAULT_BLOCK_ROWS = 9;
const MIN_BLOCK_ROWS = 4;
const DEFAULT_LAYOUT_ITEM_HEIGHT = 280;
const DEFAULT_LAYOUT_GAP = 16;

const ui = {
  zh: {
    appName: 'My Web',
    settings: '设置',
    console: '控制台',
    openConsole: '打开控制台',
    layoutMode: '布局调整',
    layoutModeActive: '布局调整模式',
    enterLayoutMode: '进入布局调整',
    exitLayoutMode: '退出布局调整',
    saveLayout: '保存当前布局',
    resetLayout: '恢复默认布局',
    defaultLayout: '默认',
    saved: '已保存',
    layoutOverlap: '布局重叠',
    layoutNoOverlap: '布局检查：未检测到重叠。',
    language: '语言',
    theme: '主题',
    light: '亮色',
    dark: '深蓝',
    heroBlock: '首页介绍板块',
    heroKicker: '个人网站模板',
    heroTitle: '一个可配置的个人档案模板',
    heroSubtitle: '基础介绍、项目、创意作品和重要记录，都可以按板块与条目自由展示。',
    uploadPhoto: '上传照片',
    ownerArea: '模板配置',
    consoleTitle: '控制台',
    password: '密码',
    unlock: '解锁控制台',
    close: '关闭',
    reset: '重置设置',
    wrongPassword: '密码不对。模板默认密码是 password，可以在源码里修改。',
    contentControl: '内容编辑',
    contentSort: '内容排序',
    visibilityControl: '可见控制',
    addSection: '新增板块',
    addItem: '新增条目',
    create: '创建',
    cancel: '取消',
    save: '保存',
    edit: '编辑',
    confirmDeleteTitle: '确认删除',
    confirmDeleteMessage: '是否确认删除“{name}”？此操作无法撤销。',
    confirmDelete: '确认删除',
    deleteSection: '删除板块',
    deleteItem: '删除条目',
    visible: '可见',
    order: '排序',
    titleZh: '标题 中文',
    titleEn: '标题 英文',
    descriptionZh: '描述 中文',
    descriptionEn: '描述 英文',
    type: '类型',
    textType: '文本',
    projectType: '项目',
    timelineType: '时间线',
    itemCount: '条目',
    noItems: '暂无条目',
    dragToSort: '拖动长条调整顺序，点保存后生效。',
    sortSaved: '排序已保存',
    markdownEditor: 'Markdown 编辑器',
    templateNote: '控制台修改会先保存在当前浏览器。要成为模板默认内容，请同步修改 src/siteData.js。',
  },
  en: {
    appName: 'My Web',
    settings: 'Settings',
    console: 'Console',
    openConsole: 'Open Console',
    layoutMode: 'Layout Tuning',
    layoutModeActive: 'Layout Tuning Mode',
    enterLayoutMode: 'Enter Layout Tuning',
    exitLayoutMode: 'Exit Layout Tuning',
    saveLayout: 'Save Layout',
    resetLayout: 'Restore Default',
    defaultLayout: 'Default',
    saved: 'Saved',
    layoutOverlap: 'Layout overlap',
    layoutNoOverlap: 'Layout check: no overlap detected.',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Deep Blue',
    heroBlock: 'Hero Block',
    heroKicker: 'Personal Website Template',
    heroTitle: 'A configurable personal archive template',
    heroSubtitle: 'Profile, projects, creative works, and milestones can be shown by section and item.',
    uploadPhoto: 'Upload Photo',
    ownerArea: 'Template Config',
    consoleTitle: 'Console',
    password: 'Password',
    unlock: 'Unlock Console',
    close: 'Close',
    reset: 'Reset Settings',
    wrongPassword: 'Wrong password. The template default is password and can be changed in source code.',
    contentControl: 'Content Editing',
    contentSort: 'Content Sorting',
    visibilityControl: 'Visibility Control',
    addSection: 'Add Section',
    addItem: 'Add Item',
    create: 'Create',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    confirmDeleteTitle: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete "{name}"? This cannot be undone.',
    confirmDelete: 'Delete',
    deleteSection: 'Delete Section',
    deleteItem: 'Delete Item',
    visible: 'Visible',
    order: 'Order',
    titleZh: 'Title ZH',
    titleEn: 'Title EN',
    descriptionZh: 'Description ZH',
    descriptionEn: 'Description EN',
    type: 'Type',
    textType: 'Text',
    projectType: 'Project',
    timelineType: 'Timeline',
    itemCount: 'items',
    noItems: 'No items',
    dragToSort: 'Drag rows to reorder. Changes apply after saving.',
    sortSaved: 'Sorting saved',
    markdownEditor: 'Markdown Editor',
    templateNote: 'Console changes are saved in this browser first. To make them template defaults, update src/siteData.js too.',
  },
};

function cloneItem(item) {
  return {
    ...item,
    title: { ...(item.title ?? {}) },
    description: { ...(item.description ?? {}) },
    tags: [...(item.tags ?? [])],
  };
}

function buildDefaultSettings() {
  return {
    language: 'zh',
    theme: 'light',
    editMode: false,
    hero: {
      visible: true,
      kicker: { zh: ui.zh.heroKicker, en: ui.en.heroKicker },
      title: { zh: ui.zh.heroTitle, en: ui.en.heroTitle },
      subtitle: { zh: ui.zh.heroSubtitle, en: ui.en.heroSubtitle },
      photo: '',
    },
    layout: {},
    sections: defaultSections.map((section) => ({ ...section, title: { ...section.title } })),
    items: defaultContentItems.map(cloneItem),
  };
}

function normalizeSettings(storedSettings) {
  const defaults = buildDefaultSettings();
  if (!storedSettings) return defaults;

  const storedItems = Array.isArray(storedSettings.items)
    ? storedSettings.items
    : defaults.items.map((item) => ({
        ...item,
        visible: storedSettings.itemVisibility?.[item.id] ?? item.visible,
      }));

  return {
    ...defaults,
    ...storedSettings,
    hero: {
      ...defaults.hero,
      ...(storedSettings.hero ?? {}),
      kicker: { ...defaults.hero.kicker, ...(storedSettings.hero?.kicker ?? {}) },
      title: { ...defaults.hero.title, ...(storedSettings.hero?.title ?? {}) },
      subtitle: { ...defaults.hero.subtitle, ...(storedSettings.hero?.subtitle ?? {}) },
    },
    sections: (Array.isArray(storedSettings.sections) ? storedSettings.sections : defaults.sections).map((section, index) => ({
      id: section.id,
      visible: section.visible !== false,
      order: Number(section.order ?? index + 1),
      title: {
        zh: section.title?.zh ?? section.label?.zh ?? '新板块',
        en: section.title?.en ?? section.label?.en ?? 'New Section',
      },
    })),
    items: storedItems.map(cloneItem),
  };
}

function readStoredSettings() {
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    return normalizeSettings(stored ? JSON.parse(stored) : null);
  } catch {
    return buildDefaultSettings();
  }
}

function getText(value, language) {
  return value?.[language] || value?.en || value?.zh || '';
}

function sortByOrder(records) {
  return [...records].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
}

function resequence(records) {
  return records.map((record, index) => ({ ...record, order: index + 1 }));
}

function sectionNumber(index) {
  return String(index + 1).padStart(2, '0');
}

function readImageFile(file, onLoad) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onLoad(String(reader.result || ''));
  reader.readAsDataURL(file);
}

function rectsOverlap(a, b) {
  return (
    a.id !== b.id &&
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

function findLayoutOverlaps(layoutItems) {
  const issues = [];
  for (let i = 0; i < layoutItems.length; i += 1) {
    for (let j = i + 1; j < layoutItems.length; j += 1) {
      if (rectsOverlap(layoutItems[i], layoutItems[j])) {
        issues.push([layoutItems[i].id, layoutItems[j].id]);
      }
    }
  }
  return issues;
}

function formatLayoutIssue(issues, text) {
  return `${text.layoutOverlap}: ${issues.map((pair) => pair.join(' / ')).join(', ')}`;
}

function buildDefaultPixelLayout(panels, containerWidth) {
  const columnGap = DEFAULT_LAYOUT_GAP;
  const columnWidth = (containerWidth - columnGap) / 2;
  const layoutItems = [];
  let y = 0;
  let column = 0;

  panels.forEach((panel) => {
    const wide = panel.section.id === 'profile' || panel.section.id === 'timeline';
    if (wide) {
      if (column !== 0) {
        y += DEFAULT_LAYOUT_ITEM_HEIGHT + columnGap;
        column = 0;
      }
      layoutItems.push({
        id: panel.section.id,
        left: 0,
        top: y,
        width: containerWidth,
        height: DEFAULT_LAYOUT_ITEM_HEIGHT,
      });
      y += DEFAULT_LAYOUT_ITEM_HEIGHT + columnGap;
      return;
    }

    layoutItems.push({
      id: panel.section.id,
      left: column * (columnWidth + columnGap),
      top: y,
      width: columnWidth,
      height: DEFAULT_LAYOUT_ITEM_HEIGHT,
    });

    if (column === 0) {
      column = 1;
    } else {
      column = 0;
      y += DEFAULT_LAYOUT_ITEM_HEIGHT + columnGap;
    }
  });

  return layoutItems;
}

function normalizeStoredLayout(item, fallback, containerWidth) {
  if (!item) return fallback;

  if (Number.isFinite(item.left) && Number.isFinite(item.top)) {
    return {
      id: fallback.id,
      left: Math.max(0, Math.min(containerWidth - 80, item.left)),
      top: Math.max(0, item.top),
      width: Math.max(120, Math.min(containerWidth, item.width ?? fallback.width)),
      height: Math.max(120, item.height ?? fallback.height),
    };
  }

  const columnGap = DEFAULT_LAYOUT_GAP;
  const columnWidth = (containerWidth - columnGap) / 2;
  return {
    id: fallback.id,
    left: Math.max(0, Math.min(containerWidth - 80, (item.x ?? 0) * (columnWidth + columnGap))),
    top: Math.max(0, (item.y ?? 0) * LAYOUT_ROW_HEIGHT),
    width: Math.max(120, Math.min(containerWidth, (item.w ?? 1) * columnWidth + Math.max(0, (item.w ?? 1) - 1) * columnGap)),
    height: Math.max(120, (item.h ?? DEFAULT_BLOCK_ROWS) * LAYOUT_ROW_HEIGHT),
  };
}

function copyLayoutMap(layout = {}) {
  return Object.fromEntries(Object.entries(layout ?? {}).map(([id, item]) => [id, { ...item }]));
}

function App() {
  const [settings, setSettings] = useState(readStoredSettings);
  const [view, setView] = useState('home');
  const [consoleUnlocked, setConsoleUnlocked] = useState(() => window.sessionStorage.getItem(CONSOLE_SESSION_KEY) === 'true');
  const [layoutDragging, setLayoutDragging] = useState(false);
  const [layoutSaved, setLayoutSaved] = useState(false);
  const [layoutIssues, setLayoutIssues] = useState([]);
  const [layoutDraft, setLayoutDraft] = useState(() => copyLayoutMap(settings.layout));

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    document.documentElement.dataset.bsTheme = settings.theme === 'dark' ? 'dark' : 'light';
  }, [settings]);

  const text = ui[settings.language];
  const sortedSections = useMemo(() => sortByOrder(settings.sections), [settings.sections]);
  const visibleItems = useMemo(() => {
    const sectionById = new Map(settings.sections.map((section) => [section.id, section]));
    return sortByOrder(settings.items)
      .filter((item) => sectionById.get(item.section)?.visible !== false)
      .filter((item) => item.visible !== false);
  }, [settings]);

  const updateSettings = (patch) => setSettings((current) => ({ ...current, ...patch }));
  const updateHero = (patch) => setSettings((current) => ({ ...current, hero: { ...current.hero, ...patch } }));
  const updateHeroText = (field, language, value) => {
    setSettings((current) => ({
      ...current,
      hero: { ...current.hero, [field]: { ...current.hero[field], [language]: value } },
    }));
  };
  const updateLayout = (layout) => {
    setLayoutSaved(false);
    const issues = findLayoutOverlaps(layout);
    setLayoutIssues(issues);
    setLayoutDraft(Object.fromEntries(layout.map((item) => [item.id, item])));
  };
  const updateSection = (sectionId, patch) => {
    setSettings((current) => ({
      ...current,
      sections: current.sections.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)),
    }));
  };
  const updateSectionTitle = (sectionId, language, value) => {
    setSettings((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, title: { ...section.title, [language]: value } } : section,
      ),
    }));
  };
  const addSection = ({ titleZh, titleEn }) => {
    setSettings((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          id: `section-${Date.now()}`,
          visible: true,
          order: Math.max(0, ...current.sections.map((section) => Number(section.order ?? 0))) + 1,
          title: { zh: titleZh || '新板块', en: titleEn || 'New Section' },
        },
      ],
    }));
  };
  const deleteSection = (sectionId) => {
    setSettings((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== sectionId),
      items: current.items.filter((item) => item.section !== sectionId),
    }));
  };
  const toggleSection = (sectionId) => {
    setSettings((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, visible: section.visible === false } : section,
      ),
    }));
  };
  const addItem = ({ sectionId, titleZh, titleEn, descriptionZh, descriptionEn, type }) => {
    setSettings((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id: `item-${Date.now()}`,
          section: sectionId,
          type: type || 'text',
          visible: true,
          order: Math.max(0, ...current.items.filter((item) => item.section === sectionId).map((item) => Number(item.order ?? 0))) + 1,
          title: { zh: titleZh || '新条目', en: titleEn || 'New Item' },
          description: { zh: descriptionZh || '', en: descriptionEn || '' },
        },
      ],
    }));
  };
  const updateItem = (itemId, patch) => {
    setSettings((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    }));
  };
  const updateItemText = (itemId, group, language, value) => {
    setSettings((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId ? { ...item, [group]: { ...item[group], [language]: value } } : item,
      ),
    }));
  };
  const deleteItem = (itemId) => setSettings((current) => ({ ...current, items: current.items.filter((item) => item.id !== itemId) }));
  const toggleItem = (itemId) => {
    setSettings((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === itemId ? { ...item, visible: item.visible === false } : item)),
    }));
  };
  const saveContentSort = ({ sections, items }) => {
    setSettings((current) => ({
      ...current,
      sections: resequence(sections).map((section) => {
        const existing = current.sections.find((record) => record.id === section.id);
        return existing ? { ...existing, order: section.order } : section;
      }),
      items: current.items.map((item) => {
        const sortedItem = items.find((record) => record.id === item.id);
        return sortedItem ? { ...item, order: sortedItem.order } : item;
      }),
    }));
  };
  const enterLayoutMode = () => {
    setLayoutDraft(copyLayoutMap(settings.layout));
    setLayoutSaved(false);
    setLayoutIssues([]);
    setView('home');
  };
  const exitLayoutMode = () => {
    setLayoutDraft(copyLayoutMap(settings.layout));
    setLayoutSaved(false);
    setLayoutIssues([]);
    updateSettings({ editMode: false });
    setView('console');
  };

  if (view === 'console') {
    return (
      <OwnerConsole
        settings={settings}
        sections={sortedSections}
        items={settings.items}
        text={text}
        language={settings.language}
        onClose={() => {
          updateSettings({ editMode: false });
          setView('home');
        }}
        onEnterLayout={enterLayoutMode}
        initialUnlocked={consoleUnlocked}
        onUnlock={() => {
          window.sessionStorage.setItem(CONSOLE_SESSION_KEY, 'true');
          setConsoleUnlocked(true);
        }}
        onUpdate={updateSettings}
        onUpdateHero={updateHero}
        onUpdateHeroText={updateHeroText}
        onUpdateSectionTitle={updateSectionTitle}
        onAddSection={addSection}
        onDeleteSection={deleteSection}
        onToggleSection={toggleSection}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        onUpdateItemText={updateItemText}
        onDeleteItem={deleteItem}
        onToggleItem={toggleItem}
        onSaveContentSort={saveContentSort}
        onReset={() => setSettings(buildDefaultSettings())}
      />
    );
  }

  return (
    <div className={`site-shell ${settings.theme === 'dark' ? 'theme-dark' : 'theme-light'} ${settings.editMode ? 'layout-mode-active' : ''} ${layoutDragging ? 'layout-dragging' : ''}`}>
      <TopBar settings={settings} text={text} onUpdate={updateSettings} onOpenConsole={() => setView('console')} />
      <main className="container py-4 py-lg-5">
        {settings.editMode && (
          <div className="layout-mode-banner mb-3">
            <div className="d-flex align-items-center gap-2">
              <LayoutGrid size={18} />
              <strong>{text.layoutModeActive}</strong>
            </div>
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              <button
                className="btn btn-outline-primary btn-icon btn-sm order-3"
                type="button"
                aria-label={text.saveLayout}
                title={text.saveLayout}
                onClick={() => {
                  const layoutItems = Object.values(layoutDraft ?? {});
                  const issues = findLayoutOverlaps(layoutItems);
                  if (issues.length) {
                    setLayoutSaved(false);
                    setLayoutIssues(issues);
                    return;
                  }
                  updateSettings({ layout: copyLayoutMap(layoutDraft) });
                  setLayoutIssues([]);
                  setLayoutSaved(true);
                }}
              >
                <Check size={16} />
              </button>
              <button className="btn btn-outline-secondary btn-sm order-1 layout-default-button" type="button" data-label={text.defaultLayout} onClick={() => { setLayoutSaved(false); setLayoutIssues([]); setLayoutDraft({}); }}>
                {text.defaultLayout}
              </button>
              <button
                className="btn btn-outline-danger btn-icon btn-sm order-2"
                type="button"
                aria-label={text.exitLayoutMode}
                title={text.exitLayoutMode}
                onClick={exitLayoutMode}
              >
                <X size={16} />
              </button>
            </div>
            {layoutSaved && <span className="layout-save-state">{text.saved}</span>}
          </div>
        )}
        {settings.editMode && (
          <div className={`layout-issue-box mb-3 ${layoutIssues.length ? 'has-issue' : ''}`}>
            {layoutIssues.length ? formatLayoutIssue(layoutIssues, text) : text.layoutNoOverlap}
          </div>
        )}
        {settings.hero.visible && (
          <Hero
            hero={settings.hero}
            language={settings.language}
          />
        )}
        <Dashboard
          sections={sortedSections}
          items={visibleItems}
          language={settings.language}
          editMode={settings.editMode}
          layout={settings.editMode ? layoutDraft : settings.layout}
          onLayoutChange={updateLayout}
          onDragStateChange={setLayoutDragging}
          onLayoutIssueChange={setLayoutIssues}
        />
      </main>
    </div>
  );
}

function TopBar({ settings, text, onUpdate, onOpenConsole }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <nav className="navbar navbar-expand border-bottom sticky-top glass-nav">
      <div className="container position-relative">
        <span className="navbar-brand fw-semibold">{text.appName}</span>
        <div className="d-flex align-items-center gap-2 ms-auto">
          <button className="btn btn-icon btn-outline-secondary" type="button" title={text.settings} aria-label={text.settings} onClick={() => setSettingsOpen((open) => !open)}>
            <Settings size={18} />
          </button>
        </div>
        {settingsOpen && <SettingsPanel settings={settings} text={text} onUpdate={onUpdate} onOpenConsole={onOpenConsole} onClose={() => setSettingsOpen(false)} />}
      </div>
    </nav>
  );
}

function SettingsPanel({ settings, text, onUpdate, onOpenConsole, onClose }) {
  return (
    <div className="settings-panel">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="h6 fw-bold mb-0">{text.settings}</h2>
        <button className="btn btn-icon btn-sm btn-outline-secondary" type="button" aria-label={text.close} onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <SettingRow label={text.language}>
        <select className="form-select form-select-sm" value={settings.language} onChange={(event) => onUpdate({ language: event.target.value })}>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </SettingRow>
      <SettingRow label={text.theme}>
        <select className="form-select form-select-sm" value={settings.theme} onChange={(event) => onUpdate({ theme: event.target.value })}>
          <option value="light">{text.light}</option>
          <option value="dark">{text.dark}</option>
        </select>
      </SettingRow>
      <div className="settings-action-row">
        <button className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2" type="button" onClick={onOpenConsole}>
          <SlidersHorizontal size={16} />
          <span>{text.openConsole}</span>
        </button>
      </div>
    </div>
  );
}

function SettingRow({ label, children }) {
  return (
    <label className="setting-row">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Hero({ hero, language }) {
  return (
    <section className="hero-band hero-with-photo mb-4">
      <div className="hero-copy">
        <p className="text-uppercase small text-primary-emphasis fw-semibold mb-2">{getText(hero.kicker, language)}</p>
        <h1 className="display-6 fw-bold mb-3">{getText(hero.title, language)}</h1>
        <div className="lead mb-0 markdown-text">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{getText(hero.subtitle, language)}</ReactMarkdown>
        </div>
      </div>
      <div className="hero-photo-box">
        {hero.photo ? <img src={hero.photo} alt="" /> : <div className="hero-photo-placeholder" />}
      </div>
    </section>
  );
}

function Dashboard({ sections, items, language, editMode, layout, onLayoutChange, onDragStateChange, onLayoutIssueChange }) {
  const panels = sections
    .filter((section) => section.visible !== false)
    .map((section, index) => ({
      section,
      index,
      items: items.filter((item) => item.section === section.id),
    }))
    .filter((panel) => panel.items.length > 0);

  if (editMode) {
    return (
      <MoveableDashboard
        panels={panels}
        language={language}
        layout={layout}
        onLayoutChange={onLayoutChange}
        onDragStateChange={onDragStateChange}
        onLayoutIssueChange={onLayoutIssueChange}
      />
    );

  }

  if (Object.keys(layout ?? {}).length > 0) {
    return <StaticLayoutDashboard panels={panels} language={language} layout={layout} />;
  }

  return (
    <div className="dashboard-grid">
      {panels.map((panel) => (
        <SectionPanel panel={panel} language={language} key={panel.section.id} />
      ))}
    </div>
  );
}

function StaticLayoutDashboard({ panels, language, layout }) {
  const canvasRef = useRef(null);
  const containerWidth = canvasRef.current?.clientWidth
    ?? document.querySelector('.site-shell main.container')?.clientWidth
    ?? Math.min(Math.max(window.innerWidth - 48, 320), 1320);
  const defaultLayout = buildDefaultPixelLayout(panels, containerWidth);
  const renderedLayout = defaultLayout.map((fallback) => normalizeStoredLayout(layout[fallback.id], fallback, containerWidth));
  const canvasHeight = Math.max(...renderedLayout.map((item) => item.top + item.height), 0) + DEFAULT_LAYOUT_GAP;

  return (
    <div className="static-layout-canvas" ref={canvasRef} style={{ minHeight: canvasHeight }}>
      {panels.map((panel) => {
        const item = renderedLayout.find((layoutItem) => layoutItem.id === panel.section.id);
        return (
          <div
            className="static-layout-panel"
            key={panel.section.id}
            style={{
              width: item.width,
              height: item.height,
              transform: `translate(${item.left}px, ${item.top}px)`,
            }}
          >
            <SectionPanel panel={panel} language={language} />
          </div>
        );
      })}
    </div>
  );
}

function MoveableDashboard({ panels, language, layout, onLayoutChange, onDragStateChange, onLayoutIssueChange }) {
  const canvasRef = useRef(null);
  const targetsRef = useRef({});
  const liveLayoutRef = useRef([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const containerWidth = canvasRef.current?.clientWidth
    ?? document.querySelector('.site-shell main.container')?.clientWidth
    ?? Math.min(Math.max(window.innerWidth - 48, 320), 1320);
  const defaultLayout = buildDefaultPixelLayout(panels, containerWidth);
  const renderedLayout = defaultLayout.map((fallback) => normalizeStoredLayout(layout[fallback.id], fallback, containerWidth));
  const canvasHeight = Math.max(...renderedLayout.map((item) => item.top + item.height), 0) + DEFAULT_LAYOUT_GAP;
  liveLayoutRef.current = renderedLayout;

  const syncIssue = (items) => {
    const issues = findLayoutOverlaps(items);
    onLayoutIssueChange(issues);
  };

  const commitLiveLayout = () => {
    const items = liveLayoutRef.current.map((item) => ({ ...item }));
    onLayoutChange(items);
    syncIssue(items);
  };

  const updateLiveItem = (sectionId, patch) => {
    liveLayoutRef.current = liveLayoutRef.current.map((item) => (item.id === sectionId ? { ...item, ...patch } : item));
  };

  return (
    <div className="moveable-canvas" ref={canvasRef} style={{ minHeight: canvasHeight }}>
      {panels.map((panel) => {
        const item = renderedLayout.find((layoutItem) => layoutItem.id === panel.section.id);
        return (
          <div
            className={`moveable-panel ${selectedId === panel.section.id ? 'selected' : ''}`}
            data-section-id={panel.section.id}
            key={panel.section.id}
            ref={(node) => {
              if (node) targetsRef.current[panel.section.id] = node;
            }}
            style={{
              width: item.width,
              height: item.height,
              transform: `translate(${item.left}px, ${item.top}px)`,
            }}
            onPointerDown={() => {
              setSelectedId(panel.section.id);
              setSelectedTarget(targetsRef.current[panel.section.id]);
            }}
          >
            <SectionPanel panel={panel} language={language} editMode />
          </div>
        );
      })}

      {selectedTarget && (
        <Moveable
          target={selectedTarget}
          container={canvasRef.current}
          draggable
          resizable
          snappable
          snapThreshold={10}
          bounds={{ left: 0, top: 0, right: containerWidth }}
          verticalGuidelines={[0, containerWidth / 2, containerWidth]}
          horizontalGuidelines={[0, 160, 320, 480, 640, 800, 960, 1120, 1280, 1440, 1600]}
          elementGuidelines={Object.values(targetsRef.current).filter((target) => target !== selectedTarget)}
          onDragStart={() => onDragStateChange(true)}
          onDrag={(event) => {
            const [left, top] = event.beforeTranslate;
            const safeTop = Math.max(0, top);
            event.target.style.transform = `translate(${left}px, ${safeTop}px)`;
            updateLiveItem(selectedId, { left, top: safeTop });
          }}
          onDragEnd={() => {
            onDragStateChange(false);
            commitLiveLayout();
          }}
          onResizeStart={() => onDragStateChange(true)}
          onResize={(event) => {
            const [left, top] = event.drag.beforeTranslate;
            const width = Math.max(160, event.width);
            const height = Math.max(140, event.height);
            const safeTop = Math.max(0, top);
            event.target.style.width = `${width}px`;
            event.target.style.height = `${height}px`;
            event.target.style.transform = `translate(${left}px, ${safeTop}px)`;
            updateLiveItem(selectedId, { left, top: safeTop, width, height });
          }}
          onResizeEnd={() => {
            onDragStateChange(false);
            commitLiveLayout();
          }}
        />
      )}
    </div>
  );
}

function SectionPanel({ panel, language, editMode = false }) {
  return (
    <section className={`content-panel ${editMode ? 'editable-panel' : ''}`}>
      <div className={`d-flex align-items-start justify-content-between gap-3 mb-3 ${editMode ? 'panel-drag-handle' : ''}`}>
        <h2 className="h4 fw-bold mb-0">{getText(panel.section.title, language)}</h2>
        <span className="section-mark">{sectionNumber(panel.index)}</span>
      </div>
      <div className={panel.section.id === 'timeline' ? 'timeline-list' : 'item-list'}>
        {panel.items.map((item) => <ContentItem item={item} language={language} key={item.id} />)}
      </div>
    </section>
  );
}

function ContentItem({ item, language }) {
  const description = getText(item.description, language);
  if (item.type === 'project') {
    return (
      <article className="soft-card">
        <div className="d-flex justify-content-between gap-3 mb-2">
          <h3 className="h6 fw-bold mb-0">{getText(item.title, language)}</h3>
          {item.year && <span className="badge rounded-pill text-bg-info">{item.year}</span>}
        </div>
        <div className="markdown-text"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown></div>
        {(item.tags ?? []).length > 0 && <div className="d-flex flex-wrap gap-2">{item.tags.map((tag) => <span className="tag-chip" key={tag}>{tag}</span>)}</div>}
      </article>
    );
  }
  if (item.type === 'timeline') {
    return (
      <article className="timeline-item">
        <time>{item.date ?? 'TBD'}</time>
        <div>
          <h3 className="h6 fw-bold mb-1">{getText(item.title, language)}</h3>
          <div className="markdown-text"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown></div>
        </div>
      </article>
    );
  }
  return (
    <article className="text-item">
      <h3 className="h6 fw-bold mb-1">{getText(item.title, language)}</h3>
      <div className="markdown-text"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown></div>
    </article>
  );
}

function OwnerConsole(props) {
  const { settings, sections, items, text, language, onClose, onEnterLayout, initialUnlocked, onUnlock, onUpdate, onUpdateHero, onUpdateHeroText, onUpdateSectionTitle, onAddSection, onDeleteSection, onToggleSection, onAddItem, onUpdateItem, onUpdateItemText, onDeleteItem, onToggleItem, onSaveContentSort, onReset } = props;
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [modal, setModal] = useState(null);
  const [editor, setEditor] = useState(null);

  const unlock = (event) => {
    event.preventDefault();
    if (password === CONSOLE_PASSWORD) {
      setUnlocked(true);
      onUnlock();
      setError('');
    } else {
      setError(text.wrongPassword);
    }
  };

  return (
    <div className={`console-screen ${settings.theme === 'dark' ? 'theme-dark' : 'theme-light'}`} role="dialog" aria-modal="true" aria-label={text.consoleTitle}>
      <header className="console-header">
        <div>
          <p className="section-kicker mb-1">{text.ownerArea}</p>
          <h2 className="h4 fw-bold mb-0">{text.consoleTitle}</h2>
        </div>
        <button className="btn btn-icon btn-outline-secondary" type="button" aria-label={text.close} onClick={onClose}><X size={18} /></button>
      </header>

      {!unlocked ? (
        <form className="console-login" onSubmit={unlock}>
          <label className="form-label" htmlFor="console-password">{text.password}</label>
          <input className="form-control mb-2" id="console-password" type="password" value={password} autoFocus onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="text-danger small mb-2">{error}</p>}
          <button className="btn btn-primary w-100" type="submit">{text.unlock}</button>
        </form>
      ) : (
        <div className="console-workspace">
          <aside className="console-sidebar">
            <button className={`console-tab ${activeTab === 'content' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('content')}>{text.contentControl}</button>
            <button className={`console-tab ${activeTab === 'sort' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('sort')}>{text.contentSort}</button>
            <button className={`console-tab ${activeTab === 'visibility' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('visibility')}>{text.visibilityControl}</button>
            <button className={`console-tab ${activeTab === 'layout' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('layout')}>{text.layoutMode}</button>
          </aside>
          <section className="console-main">
            {activeTab === 'content' && (
              <ContentControl
                settings={settings}
                sections={sections}
                items={items}
                text={text}
                language={language}
                onOpenModal={setModal}
                onOpenEditor={setEditor}
                onUpdateHero={onUpdateHero}
                onUpdateHeroText={onUpdateHeroText}
                onDeleteSection={onDeleteSection}
                onUpdateSectionTitle={onUpdateSectionTitle}
                onUpdateItem={onUpdateItem}
                onUpdateItemText={onUpdateItemText}
                onDeleteItem={onDeleteItem}
              />
            )}
            {activeTab === 'sort' && <ContentSortControl sections={sections} items={items} text={text} language={language} onSave={onSaveContentSort} />}
            {activeTab === 'visibility' && <VisibilityControl settings={settings} sections={sections} items={items} text={text} language={language} onUpdateHero={onUpdateHero} onToggleSection={onToggleSection} onToggleItem={onToggleItem} />}
            {activeTab === 'layout' && <LayoutControl settings={settings} text={text} onReset={onReset} onEnter={() => { onUpdate({ editMode: true }); onEnterLayout(); }} />}
          </section>
        </div>
      )}

      {modal?.type === 'section' && <AddSectionModal text={text} onClose={() => setModal(null)} onCreate={(payload) => { onAddSection(payload); setModal(null); }} />}
      {modal?.type === 'item' && <AddItemModal text={text} sectionId={modal.sectionId} onClose={() => setModal(null)} onCreate={(payload) => { onAddItem(payload); setModal(null); }} />}
      {editor && <MarkdownEditorModal text={text} editor={editor} onClose={() => setEditor(null)} onSave={(value) => { editor.onSave(value); setEditor(null); }} />}
    </div>
  );
}

function ContentControl({ settings, sections, items, text, language, onOpenModal, onOpenEditor, onUpdateHero, onUpdateHeroText, onDeleteSection, onUpdateSectionTitle, onUpdateItem, onUpdateItemText, onDeleteItem }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const closeDeleteModal = () => setDeleteTarget(null);
  const confirmDelete = () => {
    if (deleteTarget?.type === 'section') onDeleteSection(deleteTarget.id);
    if (deleteTarget?.type === 'item') onDeleteItem(deleteTarget.id);
    closeDeleteModal();
  };

  return (
    <div>
      <div className="console-title-row">
        <div>
          <h3 className="h5 fw-bold mb-1">{text.contentControl}</h3>
          <p className="text-muted mb-0">{text.templateNote}</p>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" type="button" onClick={() => onOpenModal({ type: 'section' })}><Plus size={16} /><span>{text.addSection}</span></button>
      </div>

      <div className="content-tree">
        <HeroEditor settings={settings} text={text} language={language} onUpdateHero={onUpdateHero} onUpdateHeroText={onUpdateHeroText} onOpenEditor={onOpenEditor} />
        {sections.map((section) => {
          const sectionItems = sortByOrder(items.filter((item) => item.section === section.id));
          return (
            <article className="content-tree-section" key={section.id}>
              <div className="content-tree-section-head">
                <div><h4 className="h6 fw-bold mb-1">{getText(section.title, language)}</h4><p className="text-muted small mb-0">{sectionItems.length} {text.itemCount}</p></div>
                <div className="section-actions">
                  <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2" type="button" onClick={() => onOpenModal({ type: 'item', sectionId: section.id })}><Plus size={15} /><span>{text.addItem}</span></button>
                  <button className="btn btn-icon btn-outline-danger btn-sm" type="button" aria-label={text.deleteSection} onClick={() => setDeleteTarget({ type: 'section', id: section.id, name: getText(section.title, language) })}><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6"><label className="form-label">{text.titleZh}</label><input className="form-control" value={section.title.zh} onChange={(event) => onUpdateSectionTitle(section.id, 'zh', event.target.value)} /></div>
                <div className="col-md-6"><label className="form-label">{text.titleEn}</label><input className="form-control" value={section.title.en} onChange={(event) => onUpdateSectionTitle(section.id, 'en', event.target.value)} /></div>
              </div>
              <div className="content-tree-items">
                {sectionItems.length === 0 ? <p className="text-muted small mb-0">{text.noItems}</p> : sectionItems.map((item) => (
                  <ItemEditor item={item} text={text} language={language} onOpenEditor={onOpenEditor} onUpdateItem={onUpdateItem} onUpdateItemText={onUpdateItemText} onRequestDelete={(target) => setDeleteTarget(target)} key={item.id} />
                ))}
              </div>
            </article>
          );
        })}
      </div>
      {deleteTarget && (
        <ConfirmModal
          text={text}
          title={text.confirmDeleteTitle}
          message={text.confirmDeleteMessage.replace('{name}', deleteTarget.name)}
          confirmLabel={text.confirmDelete}
          confirmClassName="btn-danger"
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function HeroEditor({ settings, text, language, onUpdateHero, onUpdateHeroText, onOpenEditor }) {
  return (
    <article className="content-tree-section">
      <div className="content-tree-section-head">
        <div><h4 className="h6 fw-bold mb-1">{text.heroBlock}</h4><p className="text-muted small mb-0">{getText(settings.hero.title, language)}</p></div>
      </div>
      <div className="row g-3">
        <div className="col-md-6"><label className="form-label">{text.titleZh}</label><input className="form-control" value={settings.hero.title.zh} onChange={(event) => onUpdateHeroText('title', 'zh', event.target.value)} /></div>
        <div className="col-md-6"><label className="form-label">{text.titleEn}</label><input className="form-control" value={settings.hero.title.en} onChange={(event) => onUpdateHeroText('title', 'en', event.target.value)} /></div>
        <div className="col-md-6"><label className="form-label">{text.descriptionZh}</label><div className="input-group"><textarea className="form-control" rows="2" value={settings.hero.subtitle.zh} onChange={(event) => onUpdateHeroText('subtitle', 'zh', event.target.value)} /><button className="btn btn-outline-secondary" type="button" onClick={() => onOpenEditor({ title: text.descriptionZh, value: settings.hero.subtitle.zh, onSave: (value) => onUpdateHeroText('subtitle', 'zh', value) })}><Edit3 size={16} /></button></div></div>
        <div className="col-md-6"><label className="form-label">{text.descriptionEn}</label><div className="input-group"><textarea className="form-control" rows="2" value={settings.hero.subtitle.en} onChange={(event) => onUpdateHeroText('subtitle', 'en', event.target.value)} /><button className="btn btn-outline-secondary" type="button" onClick={() => onOpenEditor({ title: text.descriptionEn, value: settings.hero.subtitle.en, onSave: (value) => onUpdateHeroText('subtitle', 'en', value) })}><Edit3 size={16} /></button></div></div>
        <div className="col-md-6"><label className="form-label">{text.uploadPhoto}</label><input className="form-control" type="file" accept="image/*" onChange={(event) => readImageFile(event.target.files?.[0], (photo) => onUpdateHero({ photo }))} /></div>
      </div>
    </article>
  );
}

function ItemEditor({ item, text, language, onOpenEditor, onUpdateItem, onUpdateItemText, onRequestDelete }) {
  return (
    <article className="item-editor">
      <div className="item-editor-head">
        <strong>{getText(item.title, 'zh') || getText(item.title, 'en')}</strong>
        <div className="section-actions">
          <button className="btn btn-icon btn-outline-danger btn-sm" type="button" aria-label={text.deleteItem} onClick={() => onRequestDelete({ type: 'item', id: item.id, name: getText(item.title, language) })}><Trash2 size={15} /></button>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-md-3"><label className="form-label">{text.type}</label><select className="form-select" value={item.type} onChange={(event) => onUpdateItem(item.id, { type: event.target.value })}><option value="text">{text.textType}</option><option value="project">{text.projectType}</option><option value="timeline">{text.timelineType}</option></select></div>
        <div className="col-md-4"><label className="form-label">{text.titleZh}</label><input className="form-control" value={item.title.zh} onChange={(event) => onUpdateItemText(item.id, 'title', 'zh', event.target.value)} /></div>
        <div className="col-md-5"><label className="form-label">{text.titleEn}</label><input className="form-control" value={item.title.en} onChange={(event) => onUpdateItemText(item.id, 'title', 'en', event.target.value)} /></div>
        <MarkdownTextControl label={text.descriptionZh} value={item.description.zh} onChange={(value) => onUpdateItemText(item.id, 'description', 'zh', value)} onOpenEditor={() => onOpenEditor({ title: text.descriptionZh, value: item.description.zh, onSave: (value) => onUpdateItemText(item.id, 'description', 'zh', value) })} />
        <MarkdownTextControl label={text.descriptionEn} value={item.description.en} onChange={(value) => onUpdateItemText(item.id, 'description', 'en', value)} onOpenEditor={() => onOpenEditor({ title: text.descriptionEn, value: item.description.en, onSave: (value) => onUpdateItemText(item.id, 'description', 'en', value) })} />
      </div>
    </article>
  );
}

function MarkdownTextControl({ label, value, onChange, onOpenEditor }) {
  return (
    <div className="col-md-6">
      <label className="form-label">{label}</label>
      <div className="input-group">
        <textarea className="form-control" rows="2" value={value} onChange={(event) => onChange(event.target.value)} />
        <button className="btn btn-outline-secondary" type="button" onClick={onOpenEditor}><Edit3 size={16} /></button>
      </div>
    </div>
  );
}

function ContentSortControl({ sections, items, text, language, onSave }) {
  const [sectionDraft, setSectionDraft] = useState(() => resequence(sortByOrder(sections)));
  const [itemDraft, setItemDraft] = useState(() => sortItemsForDraft(items));
  const [openSectionId, setOpenSectionId] = useState(sectionDraft[0]?.id ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const nextSections = resequence(sortByOrder(sections));
    setSectionDraft(nextSections);
    setItemDraft(sortItemsForDraft(items));
    setOpenSectionId((current) => current || nextSections[0]?.id || '');
  }, [sections, items]);

  const resetDraft = () => {
    const nextSections = resequence(sortByOrder(sections));
    setSectionDraft(nextSections);
    setItemDraft(sortItemsForDraft(items));
    setOpenSectionId(nextSections[0]?.id ?? '');
    setSaved(false);
  };

  const saveDraft = () => {
    const nextSections = resequence(sectionDraft);
    const nextItems = Object.values(itemDraft).flatMap((sectionItems) => resequence(sectionItems));
    onSave({ sections: nextSections, items: nextItems });
    setSectionDraft(nextSections);
    setItemDraft((current) => Object.fromEntries(Object.entries(current).map(([sectionId, sectionItems]) => [sectionId, resequence(sectionItems)])));
    setSaved(true);
  };

  return (
    <div>
      <div className="console-title-row">
        <div>
          <h3 className="h5 fw-bold mb-1">{text.contentSort}</h3>
          <p className="text-muted mb-0">{text.dragToSort}</p>
        </div>
        <div className="section-actions">
          <button className="btn btn-outline-danger btn-icon" type="button" aria-label={text.cancel} title={text.cancel} onClick={resetDraft}><X size={17} /></button>
          <button className="btn btn-outline-primary btn-icon" type="button" aria-label={text.save} title={text.save} onClick={saveDraft}><Check size={17} /></button>
        </div>
      </div>

      {saved && <p className="layout-save-state static mb-3">{text.sortSaved}</p>}

      <div className="sort-tree">
        {sectionDraft.map((section, index) => {
          const sectionItems = itemDraft[section.id] ?? [];
          const open = openSectionId === section.id;
          return (
            <article className="sort-section" key={section.id}>
              <SortRow
                label={getText(section.title, language)}
                meta={`${sectionNumber(index)} · ${sectionItems.length} ${text.itemCount}`}
                open={open}
                draggable
                onToggle={() => setOpenSectionId(open ? '' : section.id)}
                scope="sections"
                onMove={(from, to) => {
                  setSectionDraft((current) => moveRecord(current, from, to));
                  setSaved(false);
                }}
                index={index}
              />
              {open && (
                <div className="sort-items">
                  {sectionItems.length === 0 ? <p className="text-muted small mb-0">{text.noItems}</p> : sectionItems.map((item, itemIndex) => (
                    <SortRow
                      label={getText(item.title, language)}
                      meta={sectionNumber(itemIndex)}
                      draggable
                      compact
                      scope={`items-${section.id}`}
                      onMove={(from, to) => {
                        setItemDraft((current) => ({
                          ...current,
                          [section.id]: moveRecord(current[section.id] ?? [], from, to),
                        }));
                        setSaved(false);
                      }}
                      index={itemIndex}
                      key={item.id}
                    />
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function sortItemsForDraft(items) {
  return items.reduce((groups, item) => {
    const sectionItems = groups[item.section] ?? [];
    return { ...groups, [item.section]: resequence(sortByOrder([...sectionItems, item])) };
  }, {});
}

function moveRecord(records, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return records;
  const next = [...records];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return resequence(next);
}

function SortRow({ label, meta, open = false, compact = false, draggable = false, index, scope, onToggle, onMove }) {
  const handleDragStart = (event) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/x-my-web-sort', JSON.stringify({ index, scope }));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const payload = event.dataTransfer.getData('application/x-my-web-sort');
    if (!payload) return;
    try {
      const { index: from, scope: sourceScope } = JSON.parse(payload);
      if (sourceScope === scope && Number.isFinite(from)) onMove(from, index);
    } catch {
      // Ignore drops from outside the sorting list.
    }
  };

  return (
    <div
      className={`sort-row ${compact ? 'compact' : ''}`}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <button className="btn btn-icon btn-sm btn-outline-secondary sort-toggle" type="button" onClick={onToggle} aria-label={label}>
        {onToggle ? (open ? <ChevronDown size={15} /> : <ChevronRight size={15} />) : <GripVertical size={15} />}
      </button>
      <GripVertical className="sort-grip" size={16} aria-hidden="true" />
      <span className="sort-label">{label}</span>
      <span className="sort-meta">{meta}</span>
    </div>
  );
}

function VisibilityControl({ settings, sections, items, text, language, onUpdateHero, onToggleSection, onToggleItem }) {
  return (
    <div>
      <div className="console-title-row"><h3 className="h5 fw-bold mb-1">{text.visibilityControl}</h3></div>
      <div className="visibility-tree">
        <article className="tree-section">
          <div className="tree-section-row">
            <div className="tree-section-title">{settings.hero.visible ? <Eye size={18} /> : <EyeOff size={18} />}<div><strong>{text.heroBlock}</strong><span>{getText(settings.hero.title, language)}</span></div></div>
            <SwitchToggle checked={settings.hero.visible !== false} label={text.visible} hideLabel onChange={() => onUpdateHero({ visible: settings.hero.visible === false })} />
          </div>
        </article>
        {sections.map((section) => {
          const sectionItems = sortByOrder(items.filter((item) => item.section === section.id));
          const sectionVisible = section.visible !== false;
          return (
            <article className="tree-section" key={section.id}>
              <div className="tree-section-row">
                <div className="tree-section-title">{sectionVisible ? <Eye size={18} /> : <EyeOff size={18} />}<div><strong>{getText(section.title, language)}</strong><span>{sectionItems.length ? `${sectionItems.length} ${text.itemCount}` : text.noItems}</span></div></div>
                <SwitchToggle checked={sectionVisible} label={text.visible} hideLabel onChange={() => onToggleSection(section.id)} />
              </div>
              <div className={`tree-items ${sectionVisible ? '' : 'disabled'}`}>
                {sectionItems.length === 0 ? <p className="text-muted small mb-0">{text.noItems}</p> : sectionItems.map((item) => <SwitchRow label={getText(item.title, language)} checked={item.visible !== false && sectionVisible} disabled={!sectionVisible} onChange={() => onToggleItem(item.id)} key={item.id} />)}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function LayoutControl({ settings, text, onReset, onEnter }) {
  return (
    <div>
      <div className="console-title-row"><h3 className="h5 fw-bold mb-1">{text.layoutMode}</h3></div>
      <div className="basic-grid">
        <button className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2" type="button" disabled={settings.editMode} onClick={onEnter}>
          <LayoutGrid size={16} />
          <span>{settings.editMode ? text.layoutModeActive : text.enterLayoutMode}</span>
        </button>
        <button className="btn btn-outline-secondary" type="button" onClick={onReset}>{text.reset}</button>
      </div>
    </div>
  );
}

function AddSectionModal({ text, onCreate, onClose }) {
  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  return (
    <div className="custom-modal-backdrop">
      <form className="custom-modal" onSubmit={(event) => { event.preventDefault(); onCreate({ titleZh, titleEn }); }}>
        <ModalHeader title={text.addSection} text={text} onClose={onClose} />
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">{text.titleZh}</label><input className="form-control" value={titleZh} onChange={(event) => setTitleZh(event.target.value)} autoFocus /></div>
          <div className="col-md-6"><label className="form-label">{text.titleEn}</label><input className="form-control" value={titleEn} onChange={(event) => setTitleEn(event.target.value)} /></div>
        </div>
        <ModalActions text={text} onClose={onClose} />
      </form>
    </div>
  );
}

function AddItemModal({ text, sectionId, onCreate, onClose }) {
  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionZh, setDescriptionZh] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [type, setType] = useState('text');
  return (
    <div className="custom-modal-backdrop">
      <form className="custom-modal large" onSubmit={(event) => { event.preventDefault(); onCreate({ sectionId, titleZh, titleEn, descriptionZh, descriptionEn, type }); }}>
        <ModalHeader title={text.addItem} text={text} onClose={onClose} />
        <div className="row g-3">
          <div className="col-md-4"><label className="form-label">{text.type}</label><select className="form-select" value={type} onChange={(event) => setType(event.target.value)}><option value="text">{text.textType}</option><option value="project">{text.projectType}</option><option value="timeline">{text.timelineType}</option></select></div>
          <div className="col-md-6"><label className="form-label">{text.titleZh}</label><input className="form-control" value={titleZh} onChange={(event) => setTitleZh(event.target.value)} autoFocus /></div>
          <div className="col-md-6"><label className="form-label">{text.titleEn}</label><input className="form-control" value={titleEn} onChange={(event) => setTitleEn(event.target.value)} /></div>
          <div className="col-md-6"><label className="form-label">{text.descriptionZh}</label><textarea className="form-control" rows="3" value={descriptionZh} onChange={(event) => setDescriptionZh(event.target.value)} /></div>
          <div className="col-md-6"><label className="form-label">{text.descriptionEn}</label><textarea className="form-control" rows="3" value={descriptionEn} onChange={(event) => setDescriptionEn(event.target.value)} /></div>
        </div>
        <ModalActions text={text} onClose={onClose} />
      </form>
    </div>
  );
}

function MarkdownEditorModal({ text, editor, onSave, onClose }) {
  const [value, setValue] = useState(editor.value ?? '');
  const editorRef = useRef(null);
  const imageUploadHandler = (file) => new Promise((resolve) => readImageFile(file, resolve));

  return (
    <div className="custom-modal-backdrop">
      <div className="custom-modal markdown-modal">
        <ModalHeader title={`${text.markdownEditor} / ${editor.title}`} text={text} onClose={onClose} />
        <MDXEditor
          ref={editorRef}
          markdown={value}
          onChange={(markdown) => setValue(markdown)}
          contentEditableClassName="mdx-content"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            linkPlugin(),
            tablePlugin(),
            imagePlugin({ imageUploadHandler }),
            markdownShortcutPlugin(),
            diffSourcePlugin({ viewMode: 'rich-text' }),
            toolbarPlugin({
              toolbarContents: () => (
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                  <Separator />
                  <BlockTypeSelect />
                  <BoldItalicUnderlineToggles />
                  <CodeToggle />
                  <Separator />
                  <ListsToggle />
                  <CreateLink />
                  <InsertImage />
                  <InsertTable />
                  <AttachmentToolbarButton editorRef={editorRef} />
                </DiffSourceToggleWrapper>
              ),
            }),
          ]}
        />
        <div className="custom-modal-actions">
          <button className="btn btn-outline-secondary" type="button" onClick={onClose}>{text.cancel}</button>
          <button className="btn btn-primary" type="button" onClick={() => onSave(value)}>{text.save}</button>
        </div>
      </div>
    </div>
  );
}

function AttachmentToolbarButton({ editorRef }) {
  const fileRef = useRef(null);
  const insertAttachment = (file) => {
    if (!file) return;
    readImageFile(file, (src) => {
      const isImage = file.type?.startsWith('image/');
      const markdown = `${isImage ? '!' : ''}[${file.name || 'attachment'}](${src})`;
      editorRef.current?.insertMarkdown(`\n${markdown}\n`);
    });
  };

  return (
    <>
      <button className="btn btn-icon btn-outline-secondary btn-sm" type="button" title="Attachment" onClick={() => fileRef.current?.click()}>
        <Upload size={15} />
      </button>
      <input ref={fileRef} className="visually-hidden" type="file" onChange={(event) => insertAttachment(event.target.files?.[0])} />
    </>
  );
}

function ModalHeader({ title, text, onClose, titleId }) {
  return <div className="custom-modal-head"><h3 className="h5 fw-bold mb-0" id={titleId}>{title}</h3><button className="btn btn-icon btn-outline-secondary" type="button" aria-label={text.close} onClick={onClose}><X size={18} /></button></div>;
}

function ModalActions({ text, onClose }) {
  return <div className="custom-modal-actions"><button className="btn btn-outline-secondary" type="button" onClick={onClose}>{text.cancel}</button><button className="btn btn-primary" type="submit">{text.create}</button></div>;
}

function ConfirmModal({ text, title, message, confirmLabel, confirmClassName = 'btn-primary', onClose, onConfirm }) {
  return (
    <div className="custom-modal-backdrop">
      <div className="custom-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <ModalHeader title={title} text={text} onClose={onClose} titleId="confirm-title" />
        <p className="mb-0">{message}</p>
        <div className="custom-modal-actions">
          <button className="btn btn-outline-secondary" type="button" onClick={onClose}>{text.cancel}</button>
          <button className={`btn ${confirmClassName}`} type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function SwitchRow({ label, checked, onChange, disabled = false }) {
  return <label className={`switch-row ${disabled ? 'disabled' : ''}`}><span>{label}</span><input className="form-check-input" type="checkbox" checked={checked} disabled={disabled} onChange={onChange} /></label>;
}

function SwitchToggle({ checked, label, onChange, hideLabel = false }) {
  return <label className="switch-toggle">{!hideLabel && <span>{label}</span>}<input className="form-check-input" type="checkbox" checked={checked} aria-label={label} onChange={onChange} /></label>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
