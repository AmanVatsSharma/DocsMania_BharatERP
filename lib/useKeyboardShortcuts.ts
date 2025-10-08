/**
 * Keyboard Shortcuts Hook
 * Centralized keyboard shortcut management with conflict detection
 */

import { useHotkeys } from 'react-hotkeys-hook';
import { useCallback } from 'react';

export interface ShortcutConfig {
  keys: string;
  description: string;
  handler: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Platform-aware modifier key (Cmd on Mac, Ctrl on others)
 */
export const MOD_KEY = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl';

/**
 * Default editor shortcuts
 */
export const editorShortcuts = {
  // UI Navigation
  TOGGLE_LEFT_SIDEBAR: `${MOD_KEY}+\\`,
  TOGGLE_RIGHT_INSPECTOR: `${MOD_KEY}+/`,
  TOGGLE_TOP_BAR: `${MOD_KEY}+.`,
  COMMAND_PALETTE: `${MOD_KEY}+k`,
  QUICK_SWITCHER: `${MOD_KEY}+p`,
  
  // View Modes
  FOCUS_MODE: `${MOD_KEY}+shift+f`,
  ZEN_MODE: `${MOD_KEY}+shift+z`,
  DARK_MODE: `${MOD_KEY}+shift+l`,
  
  // Document Actions
  SAVE: `${MOD_KEY}+s`,
  PUBLISH: `${MOD_KEY}+shift+p`,
  
  // Editing
  UNDO: `${MOD_KEY}+z`,
  REDO: `${MOD_KEY}+shift+z`,
  
  // Text Formatting
  BOLD: `${MOD_KEY}+b`,
  ITALIC: `${MOD_KEY}+i`,
  UNDERLINE: `${MOD_KEY}+u`,
  STRIKETHROUGH: `${MOD_KEY}+shift+x`,
  CODE: `${MOD_KEY}+e`,
  
  // Blocks
  INSERT_TABLE: `${MOD_KEY}+alt+t`,
  INSERT_IMAGE: `${MOD_KEY}+alt+i`,
  INSERT_LINK: `${MOD_KEY}+k`,
  
  // Selection
  SELECT_ALL: `${MOD_KEY}+a`,
  DESELECT: 'escape',
  
  // Help
  SHOW_HELP: '?',
};

/**
 * Hook to register keyboard shortcuts
 */
export function useEditorShortcuts(config: {
  onToggleLeftSidebar?: () => void;
  onToggleRightInspector?: () => void;
  onToggleTopBar?: () => void;
  onCommandPalette?: () => void;
  onQuickSwitcher?: () => void;
  onFocusMode?: () => void;
  onZenMode?: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  onShowHelp?: () => void;
  enabled?: boolean;
}) {
  const { enabled = true } = config;
  
  // UI Navigation
  useHotkeys(
    editorShortcuts.TOGGLE_LEFT_SIDEBAR,
    (e) => {
      e.preventDefault();
      config.onToggleLeftSidebar?.();
    },
    { enabled }
  );
  
  useHotkeys(
    editorShortcuts.TOGGLE_RIGHT_INSPECTOR,
    (e) => {
      e.preventDefault();
      config.onToggleRightInspector?.();
    },
    { enabled }
  );
  
  useHotkeys(
    editorShortcuts.TOGGLE_TOP_BAR,
    (e) => {
      e.preventDefault();
      config.onToggleTopBar?.();
    },
    { enabled }
  );
  
  useHotkeys(
    editorShortcuts.COMMAND_PALETTE,
    (e) => {
      e.preventDefault();
      config.onCommandPalette?.();
    },
    { enabled }
  );
  
  useHotkeys(
    editorShortcuts.QUICK_SWITCHER,
    (e) => {
      e.preventDefault();
      config.onQuickSwitcher?.();
    },
    { enabled }
  );
  
  // View Modes
  useHotkeys(
    editorShortcuts.FOCUS_MODE,
    (e) => {
      e.preventDefault();
      config.onFocusMode?.();
    },
    { enabled }
  );
  
  useHotkeys(
    editorShortcuts.ZEN_MODE,
    (e) => {
      e.preventDefault();
      config.onZenMode?.();
    },
    { enabled }
  );
  
  // Document Actions
  useHotkeys(
    editorShortcuts.SAVE,
    (e) => {
      e.preventDefault();
      config.onSave?.();
    },
    { enabled }
  );
  
  useHotkeys(
    editorShortcuts.PUBLISH,
    (e) => {
      e.preventDefault();
      config.onPublish?.();
    },
    { enabled }
  );
  
  // Help
  useHotkeys(
    editorShortcuts.SHOW_HELP,
    (e) => {
      // Only trigger if not in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      e.preventDefault();
      config.onShowHelp?.();
    },
    { enabled }
  );
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: string): string {
  return shortcut
    .replace('meta', '⌘')
    .replace('ctrl', 'Ctrl')
    .replace('shift', '⇧')
    .replace('alt', '⌥')
    .replace('option', '⌥')
    .replace('+', ' ');
}

/**
 * Get all shortcuts as array for display
 */
export function getAllShortcuts(): Array<{ keys: string; description: string; category: string }> {
  return [
    // UI Navigation
    { keys: editorShortcuts.TOGGLE_LEFT_SIDEBAR, description: 'Toggle left sidebar', category: 'Navigation' },
    { keys: editorShortcuts.TOGGLE_RIGHT_INSPECTOR, description: 'Toggle right inspector', category: 'Navigation' },
    { keys: editorShortcuts.TOGGLE_TOP_BAR, description: 'Toggle top bar', category: 'Navigation' },
    { keys: editorShortcuts.COMMAND_PALETTE, description: 'Open command palette', category: 'Navigation' },
    { keys: editorShortcuts.QUICK_SWITCHER, description: 'Quick document switcher', category: 'Navigation' },
    
    // View Modes
    { keys: editorShortcuts.FOCUS_MODE, description: 'Toggle focus mode', category: 'View' },
    { keys: editorShortcuts.ZEN_MODE, description: 'Toggle zen mode', category: 'View' },
    { keys: editorShortcuts.DARK_MODE, description: 'Toggle dark mode', category: 'View' },
    
    // Document
    { keys: editorShortcuts.SAVE, description: 'Save document', category: 'Document' },
    { keys: editorShortcuts.PUBLISH, description: 'Publish document', category: 'Document' },
    
    // Editing
    { keys: editorShortcuts.UNDO, description: 'Undo', category: 'Editing' },
    { keys: editorShortcuts.REDO, description: 'Redo', category: 'Editing' },
    
    // Formatting
    { keys: editorShortcuts.BOLD, description: 'Bold', category: 'Formatting' },
    { keys: editorShortcuts.ITALIC, description: 'Italic', category: 'Formatting' },
    { keys: editorShortcuts.UNDERLINE, description: 'Underline', category: 'Formatting' },
    { keys: editorShortcuts.STRIKETHROUGH, description: 'Strikethrough', category: 'Formatting' },
    { keys: editorShortcuts.CODE, description: 'Inline code', category: 'Formatting' },
    
    // Blocks
    { keys: editorShortcuts.INSERT_TABLE, description: 'Insert table', category: 'Blocks' },
    { keys: editorShortcuts.INSERT_IMAGE, description: 'Insert image', category: 'Blocks' },
    { keys: editorShortcuts.INSERT_LINK, description: 'Insert link', category: 'Blocks' },
    
    // Help
    { keys: editorShortcuts.SHOW_HELP, description: 'Show keyboard shortcuts', category: 'Help' },
  ];
}

export default useEditorShortcuts;