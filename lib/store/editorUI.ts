/**
 * Editor UI State Management with Zustand
 * Enterprise-grade state management for all UI interactions
 */

import { create } from 'zustand';

export type ViewMode = 'normal' | 'focus' | 'zen' | 'reading';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface EditorUIState {
  // Panel States
  leftSidebarOpen: boolean;
  leftSidebarCollapsed: boolean;
  rightInspectorOpen: boolean;
  topBarVisible: boolean;
  topBarPinned: boolean;
  
  // View Modes
  viewMode: ViewMode;
  themeMode: ThemeMode;
  
  // Canvas Settings
  canvasWidth: number; // max width in px
  canvasPadding: number;
  showLineNumbers: boolean;
  
  // UI Preferences
  animationsEnabled: boolean;
  autoHideTopBar: boolean;
  autoShowInspector: boolean;
  
  // Temporary UI States (not persisted)
  isScrollingDown: boolean;
  hoveredComponent: string | null;
  selectedComponent: string | null;
  
  // Actions - Panel Controls
  setLeftSidebarOpen: (open: boolean) => void;
  toggleLeftSidebar: () => void;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  
  setRightInspectorOpen: (open: boolean) => void;
  toggleRightInspector: () => void;
  
  setTopBarVisible: (visible: boolean) => void;
  setTopBarPinned: (pinned: boolean) => void;
  
  // Actions - View Modes
  setViewMode: (mode: ViewMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  
  // Actions - Canvas
  setCanvasWidth: (width: number) => void;
  setCanvasPadding: (padding: number) => void;
  toggleLineNumbers: () => void;
  
  // Actions - UI Preferences
  setAnimationsEnabled: (enabled: boolean) => void;
  setAutoHideTopBar: (enabled: boolean) => void;
  setAutoShowInspector: (enabled: boolean) => void;
  
  // Actions - Temporary States
  setScrollingDown: (scrolling: boolean) => void;
  setHoveredComponent: (id: string | null) => void;
  setSelectedComponent: (id: string | null) => void;
  
  // Utility Actions
  resetToDefaults: () => void;
  enterFocusMode: () => void;
  enterZenMode: () => void;
  exitSpecialMode: () => void;
}

const defaultState = {
  leftSidebarOpen: true,
  leftSidebarCollapsed: false,
  rightInspectorOpen: false,
  topBarVisible: true,
  topBarPinned: false,
  viewMode: 'normal' as ViewMode,
  themeMode: 'system' as ThemeMode,
  canvasWidth: 720,
  canvasPadding: 48,
  showLineNumbers: false,
  animationsEnabled: true,
  autoHideTopBar: true,
  autoShowInspector: true,
  isScrollingDown: false,
  hoveredComponent: null,
  selectedComponent: null,
};

export const useEditorUI = create<EditorUIState>()((set, get) => ({
  ...defaultState,
      
      // Panel Controls
      setLeftSidebarOpen: (open: boolean) => set({ leftSidebarOpen: open }),
      toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
      setLeftSidebarCollapsed: (collapsed: boolean) => set({ leftSidebarCollapsed: collapsed }),
      
      setRightInspectorOpen: (open: boolean) => set({ rightInspectorOpen: open }),
      toggleRightInspector: () => set((state) => ({ rightInspectorOpen: !state.rightInspectorOpen })),
      
      setTopBarVisible: (visible: boolean) => set({ topBarVisible: visible }),
      setTopBarPinned: (pinned: boolean) => set({ topBarPinned: pinned }),
      
      // View Modes
      setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
        // Apply theme to document
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          if (mode === 'dark') {
            root.classList.add('dark');
          } else if (mode === 'light') {
            root.classList.remove('dark');
          } else {
            // System preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', prefersDark);
          }
        }
      },
      
      // Canvas Settings
      setCanvasWidth: (width: number) => set({ canvasWidth: Math.max(400, Math.min(1200, width)) }),
      setCanvasPadding: (padding: number) => set({ canvasPadding: Math.max(0, Math.min(100, padding)) }),
      toggleLineNumbers: () => set((state) => ({ showLineNumbers: !state.showLineNumbers })),
      
      // UI Preferences
      setAnimationsEnabled: (enabled: boolean) => set({ animationsEnabled: enabled }),
      setAutoHideTopBar: (enabled: boolean) => set({ autoHideTopBar: enabled }),
      setAutoShowInspector: (enabled: boolean) => set({ autoShowInspector: enabled }),
      
      // Temporary States
      setScrollingDown: (scrolling: boolean) => set({ isScrollingDown: scrolling }),
      setHoveredComponent: (id: string | null) => set({ hoveredComponent: id }),
      setSelectedComponent: (id: string | null) => {
        set({ selectedComponent: id });
        // Auto-show inspector if enabled and something is selected
        if (id && get().autoShowInspector) {
          set({ rightInspectorOpen: true });
        }
      },
      
      // Utility Actions
      resetToDefaults: () => set(defaultState),
      
      enterFocusMode: () => set({
        viewMode: 'focus',
        leftSidebarOpen: false,
        rightInspectorOpen: false,
        topBarVisible: false,
      }),
      
      enterZenMode: () => set({
        viewMode: 'zen',
        leftSidebarOpen: false,
        rightInspectorOpen: false,
        topBarVisible: false,
        leftSidebarCollapsed: false,
      }),
      
      exitSpecialMode: () => set({
        viewMode: 'normal',
        leftSidebarOpen: true,
        topBarVisible: true,
      }),
}));

// Selector hooks for better performance
export const useLeftSidebarOpen = () => useEditorUI((state) => state.leftSidebarOpen);
export const useRightInspectorOpen = () => useEditorUI((state) => state.rightInspectorOpen);
export const useTopBarVisible = () => useEditorUI((state) => state.topBarVisible);
export const useViewMode = () => useEditorUI((state) => state.viewMode);
export const useThemeMode = () => useEditorUI((state) => state.themeMode);
export const useAnimationsEnabled = () => useEditorUI((state) => state.animationsEnabled);

// Export singleton instance for external use
export default useEditorUI;