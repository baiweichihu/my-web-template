import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import GridLayout from 'react-grid-layout/legacy';
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
  Edit3,
  Eye,
  EyeOff,
  LayoutGrid,
  Plus,
  Settings,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '@mdxeditor/editor/style.css';
import './styles.css';
import { defaultContentItems, defaultSections } from './siteData';

const CONSOLE_PASSWORD = 'password';
const SETTINGS_KEY = 'my-web-template-settings';

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
    saved: '已保存',
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
    visibilityControl: '可见控制',
    addSection: '新增板块',
    addItem: '新增条目',
    create: '创建',
    cancel: '取消',
    save: '保存',
    edit: '编辑',
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
    saved: 'Saved',
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
    visibilityControl: 'Visibility Control',
    addSection: 'Add Section',
    addItem: 'Add Item',
    create: 'Create',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
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

function sectionNumber(index) {
  return String(index + 1).padStart(2, '0');
}

function readImageFile(file, onLoad) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onLoad(String(reader.result || ''));
  reader.readAsDataURL(file);
}

function App() {
  const [settings, setSettings] = useState(readStoredSettings);
  const [view, setView] = useState('home');
  const [consoleUnlocked, setConsoleUnlocked] = useState(false);
  const [layoutDragging, setLayoutDragging] = useState(false);
  const [layoutSaved, setLayoutSaved] = useState(false);

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
    setSettings((current) => ({
      ...current,
      layout: Object.fromEntries(layout.map((item) => [item.i, item])),
    }));
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
  const addSection = ({ titleZh, titleEn, order }) => {
    setSettings((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          id: `section-${Date.now()}`,
          visible: true,
          order: Number(order) || current.sections.length + 1,
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
  const addItem = ({ sectionId, titleZh, titleEn, descriptionZh, descriptionEn, type, order }) => {
    setSettings((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id: `item-${Date.now()}`,
          section: sectionId,
          type: type || 'text',
          visible: true,
          order: Number(order) || current.items.filter((item) => item.section === sectionId).length + 1,
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
        onEnterLayout={() => setView('home')}
        initialUnlocked={consoleUnlocked}
        onUnlock={() => setConsoleUnlocked(true)}
        onUpdate={updateSettings}
        onUpdateHero={updateHero}
        onUpdateHeroText={updateHeroText}
        onUpdateSection={updateSection}
        onUpdateSectionTitle={updateSectionTitle}
        onAddSection={addSection}
        onDeleteSection={deleteSection}
        onToggleSection={toggleSection}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        onUpdateItemText={updateItemText}
        onDeleteItem={deleteItem}
        onToggleItem={toggleItem}
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
              <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => setLayoutSaved(true)}>
                {text.saveLayout}
              </button>
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => updateSettings({ layout: {} })}>
                {text.resetLayout}
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => { updateSettings({ editMode: false }); setView('console'); }}>
                {text.exitLayoutMode}
              </button>
            </div>
            {layoutSaved && <span className="layout-save-state">{text.saved}</span>}
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
          layout={settings.layout}
          onLayoutChange={updateLayout}
          onDragStateChange={setLayoutDragging}
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

function Dashboard({ sections, items, language, editMode, layout, onLayoutChange, onDragStateChange }) {
  const panels = sections
    .filter((section) => section.visible !== false)
    .map((section, index) => ({
      section,
      index,
      items: items.filter((item) => item.section === section.id),
    }))
    .filter((panel) => panel.items.length > 0);

  if (editMode) {
    const containerWidth = typeof document === 'undefined'
      ? null
      : document.querySelector('.site-shell main.container')?.clientWidth;
    const gridWidth = containerWidth ?? (typeof window === 'undefined' ? 960 : Math.min(Math.max(window.innerWidth - 48, 320), 1320));
    let nextY = 0;
    let nextColumn = 0;
    const gridLayout = panels.map((panel) => {
      if (layout[panel.section.id]) {
        return layout[panel.section.id];
      }

      const wide = panel.section.id === 'profile' || panel.section.id === 'timeline';
      if (wide) {
        if (nextColumn !== 0) {
          nextY += 3;
          nextColumn = 0;
        }
        const item = {
          i: panel.section.id,
          x: 0,
          y: nextY,
          w: 2,
          h: 3,
          minW: 1,
          minH: 2,
          resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
        };
        nextY += 3;
        return item;
      }

      const item = {
        i: panel.section.id,
        x: nextColumn,
        y: nextY,
        w: 1,
        h: 3,
        minW: 1,
        minH: 2,
        resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
      };
      if (nextColumn === 0) {
        nextColumn = 1;
      } else {
        nextColumn = 0;
        nextY += 3;
      }
      return item;
    });

    const moveLinkedBelow = (items, target, oldBottom, delta) => {
      if (delta === 0) return items;
      const overlapsX = (item) => item.x < target.x + target.w && item.x + item.w > target.x;
      return items.map((item) => {
        if (item.i !== target.i && item.y >= oldBottom && overlapsX(item)) {
          return { ...item, y: Math.max(0, item.y + delta) };
        }
        return item;
      });
    };

    const overlaps = (a, b) =>
      a.i !== b.i &&
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y;

    const normalizeLayout = (items) => {
      const next = items
        .map((item) => ({
          ...item,
          x: Math.max(0, Math.min(1, item.x)),
          w: Math.max(1, Math.min(2, item.w)),
          y: Math.max(0, item.y),
          h: Math.max(2, item.h),
        }))
        .map((item) => (item.x + item.w > 2 ? { ...item, x: 2 - item.w } : item))
        .sort((a, b) => a.y - b.y || a.x - b.x);

      let changed = true;
      let guard = 0;
      while (changed && guard < 80) {
        changed = false;
        guard += 1;

        for (const item of next) {
          while (next.some((other) => overlaps(item, other))) {
            item.y += 1;
            changed = true;
          }
        }
      }

      return next;
    };

    const renderedLayout = normalizeLayout(gridLayout);

    const adjustLayout = (sectionId, action) => {
      const current = renderedLayout.map((item) => ({ ...item }));
      const target = current.find((item) => item.i === sectionId);
      if (!target) return;

      const oldBottom = target.y + target.h;
      if (action === 'left-out' && target.x > 0) {
        target.x -= 1;
        target.w += 1;
      }
      if (action === 'left-in' && target.x === 0 && target.w > 1) {
        target.x += 1;
        target.w -= 1;
      }
      if (action === 'right-in' && target.w > 1) {
        target.w -= 1;
      }
      if (action === 'right-out' && target.x + target.w < 2) {
        target.w += 1;
      }
      if (action === 'top-up' && target.y > 0) {
        target.y -= 1;
        target.h += 1;
      }
      if (action === 'top-down' && target.h > 2) {
        target.y += 1;
        target.h -= 1;
      }
      if (action === 'bottom-down') {
        target.h += 1;
        onLayoutChange(normalizeLayout(moveLinkedBelow(current, target, oldBottom, 1)));
        return;
      }
      if (action === 'bottom-up' && target.h > 2) {
        target.h -= 1;
        onLayoutChange(normalizeLayout(moveLinkedBelow(current, target, oldBottom, -1)));
        return;
      }
      onLayoutChange(normalizeLayout(current));
    };

    return (
      <GridLayout
        className="layout-grid"
        cols={2}
        rowHeight={96}
        margin={[16, 16]}
        width={gridWidth}
        layout={renderedLayout}
        onLayoutChange={onLayoutChange}
        compactType={null}
        preventCollision={false}
        onDragStart={() => onDragStateChange(true)}
        onDragStop={() => onDragStateChange(false)}
        onResizeStart={() => onDragStateChange(true)}
        onResizeStop={() => onDragStateChange(false)}
        isDraggable={false}
        isResizable={false}
        draggableHandle=".panel-drag-handle"
      >
        {panels.map((panel) => (
          <div key={panel.section.id}>
            <SectionPanel panel={panel} language={language} editMode onLayoutAdjust={adjustLayout} />
          </div>
        ))}
      </GridLayout>
    );
  }

  return (
    <div className="dashboard-grid">
      {panels.map((panel) => (
        <SectionPanel panel={panel} language={language} key={panel.section.id} />
      ))}
    </div>
  );
}

function SectionPanel({ panel, language, editMode = false, onLayoutAdjust }) {
  return (
    <section className={`content-panel ${editMode ? 'editable-panel' : ''}`}>
      <div className={`d-flex align-items-start justify-content-between gap-3 mb-3 ${editMode ? 'panel-drag-handle' : ''}`}>
        <h2 className="h4 fw-bold mb-0">{getText(panel.section.title, language)}</h2>
        <span className="section-mark">{sectionNumber(panel.index)}</span>
      </div>
      {editMode && (
        <LayoutEdgeControls sectionId={panel.section.id} onAdjust={onLayoutAdjust} />
      )}
      <div className={panel.section.id === 'timeline' ? 'timeline-list' : 'item-list'}>
        {panel.items.map((item) => <ContentItem item={item} language={language} key={item.id} />)}
      </div>
    </section>
  );
}

function LayoutEdgeControls({ sectionId, onAdjust }) {
  const click = (action) => (event) => {
    event.stopPropagation();
    onAdjust(sectionId, action);
  };

  return (
    <div className="layout-edge-controls" aria-hidden="true">
      <div className="edge-control edge-left">
        <button type="button" onClick={click('left-out')}>←</button>
        <button type="button" onClick={click('left-in')}>→</button>
      </div>
      <div className="edge-control edge-right">
        <button type="button" onClick={click('right-in')}>←</button>
        <button type="button" onClick={click('right-out')}>→</button>
      </div>
      <div className="edge-control edge-top">
        <button type="button" onClick={click('top-up')}>↑</button>
        <button type="button" onClick={click('top-down')}>↓</button>
      </div>
      <div className="edge-control edge-bottom">
        <button type="button" onClick={click('bottom-up')}>↑</button>
        <button type="button" onClick={click('bottom-down')}>↓</button>
      </div>
    </div>
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
  const { settings, sections, items, text, language, onClose, onEnterLayout, initialUnlocked, onUnlock, onUpdate, onUpdateHero, onUpdateHeroText, onUpdateSection, onUpdateSectionTitle, onAddSection, onDeleteSection, onToggleSection, onAddItem, onUpdateItem, onUpdateItemText, onDeleteItem, onToggleItem, onReset } = props;
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
                onUpdateSection={onUpdateSection}
                onUpdateSectionTitle={onUpdateSectionTitle}
                onToggleSection={onToggleSection}
                onUpdateItem={onUpdateItem}
                onUpdateItemText={onUpdateItemText}
                onDeleteItem={onDeleteItem}
                onToggleItem={onToggleItem}
              />
            )}
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

function ContentControl({ settings, sections, items, text, language, onOpenModal, onOpenEditor, onUpdateHero, onUpdateHeroText, onDeleteSection, onUpdateSection, onUpdateSectionTitle, onToggleSection, onUpdateItem, onUpdateItemText, onDeleteItem, onToggleItem }) {
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
                  <SwitchToggle checked={section.visible !== false} label={text.visible} onChange={() => onToggleSection(section.id)} />
                  <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2" type="button" onClick={() => onOpenModal({ type: 'item', sectionId: section.id })}><Plus size={15} /><span>{text.addItem}</span></button>
                  <button className="btn btn-icon btn-outline-danger btn-sm" type="button" aria-label={text.deleteSection} onClick={() => onDeleteSection(section.id)}><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-2"><label className="form-label">{text.order}</label><input className="form-control" type="number" value={section.order} onChange={(event) => onUpdateSection(section.id, { order: Number(event.target.value) })} /></div>
                <div className="col-md-5"><label className="form-label">{text.titleZh}</label><input className="form-control" value={section.title.zh} onChange={(event) => onUpdateSectionTitle(section.id, 'zh', event.target.value)} /></div>
                <div className="col-md-5"><label className="form-label">{text.titleEn}</label><input className="form-control" value={section.title.en} onChange={(event) => onUpdateSectionTitle(section.id, 'en', event.target.value)} /></div>
              </div>
              <div className="content-tree-items">
                {sectionItems.length === 0 ? <p className="text-muted small mb-0">{text.noItems}</p> : sectionItems.map((item) => (
                  <ItemEditor item={item} text={text} onOpenEditor={onOpenEditor} onUpdateItem={onUpdateItem} onUpdateItemText={onUpdateItemText} onDeleteItem={onDeleteItem} onToggleItem={onToggleItem} key={item.id} />
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function HeroEditor({ settings, text, language, onUpdateHero, onUpdateHeroText, onOpenEditor }) {
  return (
    <article className="content-tree-section">
      <div className="content-tree-section-head">
        <div><h4 className="h6 fw-bold mb-1">{text.heroBlock}</h4><p className="text-muted small mb-0">{getText(settings.hero.title, language)}</p></div>
        <SwitchToggle checked={settings.hero.visible !== false} label={text.visible} onChange={() => onUpdateHero({ visible: settings.hero.visible === false })} />
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

function ItemEditor({ item, text, onOpenEditor, onUpdateItem, onUpdateItemText, onDeleteItem, onToggleItem }) {
  return (
    <article className="item-editor">
      <div className="item-editor-head">
        <strong>{getText(item.title, 'zh') || getText(item.title, 'en')}</strong>
        <div className="section-actions">
          <SwitchToggle checked={item.visible !== false} label={text.visible} onChange={() => onToggleItem(item.id)} />
          <button className="btn btn-icon btn-outline-danger btn-sm" type="button" aria-label={text.deleteItem} onClick={() => onDeleteItem(item.id)}><Trash2 size={15} /></button>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-md-2"><label className="form-label">{text.order}</label><input className="form-control" type="number" value={item.order} onChange={(event) => onUpdateItem(item.id, { order: Number(event.target.value) })} /></div>
        <div className="col-md-3"><label className="form-label">{text.type}</label><select className="form-select" value={item.type} onChange={(event) => onUpdateItem(item.id, { type: event.target.value })}><option value="text">{text.textType}</option><option value="project">{text.projectType}</option><option value="timeline">{text.timelineType}</option></select></div>
        <div className="col-md-3"><label className="form-label">{text.titleZh}</label><input className="form-control" value={item.title.zh} onChange={(event) => onUpdateItemText(item.id, 'title', 'zh', event.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">{text.titleEn}</label><input className="form-control" value={item.title.en} onChange={(event) => onUpdateItemText(item.id, 'title', 'en', event.target.value)} /></div>
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
  const [order, setOrder] = useState('');
  return (
    <div className="custom-modal-backdrop">
      <form className="custom-modal" onSubmit={(event) => { event.preventDefault(); onCreate({ titleZh, titleEn, order }); }}>
        <ModalHeader title={text.addSection} text={text} onClose={onClose} />
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">{text.titleZh}</label><input className="form-control" value={titleZh} onChange={(event) => setTitleZh(event.target.value)} autoFocus /></div>
          <div className="col-md-6"><label className="form-label">{text.titleEn}</label><input className="form-control" value={titleEn} onChange={(event) => setTitleEn(event.target.value)} /></div>
          <div className="col-md-4"><label className="form-label">{text.order}</label><input className="form-control" type="number" value={order} onChange={(event) => setOrder(event.target.value)} /></div>
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
  const [order, setOrder] = useState('');
  return (
    <div className="custom-modal-backdrop">
      <form className="custom-modal large" onSubmit={(event) => { event.preventDefault(); onCreate({ sectionId, titleZh, titleEn, descriptionZh, descriptionEn, type, order }); }}>
        <ModalHeader title={text.addItem} text={text} onClose={onClose} />
        <div className="row g-3">
          <div className="col-md-4"><label className="form-label">{text.type}</label><select className="form-select" value={type} onChange={(event) => setType(event.target.value)}><option value="text">{text.textType}</option><option value="project">{text.projectType}</option><option value="timeline">{text.timelineType}</option></select></div>
          <div className="col-md-4"><label className="form-label">{text.order}</label><input className="form-control" type="number" value={order} onChange={(event) => setOrder(event.target.value)} /></div>
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

function ModalHeader({ title, text, onClose }) {
  return <div className="custom-modal-head"><h3 className="h5 fw-bold mb-0">{title}</h3><button className="btn btn-icon btn-outline-secondary" type="button" aria-label={text.close} onClick={onClose}><X size={18} /></button></div>;
}

function ModalActions({ text, onClose }) {
  return <div className="custom-modal-actions"><button className="btn btn-outline-secondary" type="button" onClick={onClose}>{text.cancel}</button><button className="btn btn-primary" type="submit">{text.create}</button></div>;
}

function SwitchRow({ label, checked, onChange, disabled = false }) {
  return <label className={`switch-row ${disabled ? 'disabled' : ''}`}><span>{label}</span><input className="form-check-input" type="checkbox" checked={checked} disabled={disabled} onChange={onChange} /></label>;
}

function SwitchToggle({ checked, label, onChange, hideLabel = false }) {
  return <label className="switch-toggle">{!hideLabel && <span>{label}</span>}<input className="form-check-input" type="checkbox" checked={checked} aria-label={label} onChange={onChange} /></label>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
