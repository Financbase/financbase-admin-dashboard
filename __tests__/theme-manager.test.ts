/**
 * ThemeManager Test Suite
 * Tests the centralized theme management functionality
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeManager, themeManager } from '@/lib/services/theme-manager';
import type { ThemeMode, ResolvedTheme } from '@/lib/types/theme';

describe('ThemeManager', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    // Create a fresh instance for testing
    manager = ThemeManager.getInstance({
      storageKey: 'test-theme',
      syncWithPreferences: false, // Disable API sync for tests
      enableSystem: false,
    });
  });

  afterEach(() => {
    // Clean up
    if (typeof window !== 'undefined') {
      localStorage.removeItem('test-theme');
    }
    manager.destroy();
  });

  describe('Initialization', () => {
    it('should create singleton instance', () => {
      const instance1 = ThemeManager.getInstance();
      const instance2 = ThemeManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with default theme', () => {
      const state = manager.getState();
      expect(state.mode).toBe('light');
      expect(state.resolved).toBe('light');
      expect(state.isSystem).toBe(false);
    });
  });

  describe('Theme Management', () => {
    it('should set theme to dark', async () => {
      await manager.setTheme('dark');
      expect(manager.getMode()).toBe('dark');
      expect(manager.getResolvedTheme()).toBe('dark');
      expect(manager.isDark()).toBe(true);
      expect(manager.isLight()).toBe(false);
    });

    it('should set theme to light', async () => {
      await manager.setTheme('dark');
      await manager.setTheme('light');
      expect(manager.getMode()).toBe('light');
      expect(manager.getResolvedTheme()).toBe('light');
      expect(manager.isDark()).toBe(false);
      expect(manager.isLight()).toBe(true);
    });

    it('should toggle theme', async () => {
      await manager.setTheme('light');
      await manager.toggleTheme();
      expect(manager.getResolvedTheme()).toBe('dark');
      await manager.toggleTheme();
      expect(manager.getResolvedTheme()).toBe('light');
    });

    it('should reset to default theme', async () => {
      await manager.setTheme('dark');
      await manager.reset();
      expect(manager.getMode()).toBe('light');
      expect(manager.getResolvedTheme()).toBe('light');
    });
  });

  describe('Persistence', () => {
    it('should save theme to localStorage', async () => {
      await manager.setTheme('dark', true);
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('test-theme');
        expect(stored).toBe('dark');
      }
    });

    it('should load theme from localStorage', async () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('test-theme', 'dark');
        // Destroy existing instance to force reload
        manager.destroy();
        const newManager = ThemeManager.getInstance({
          storageKey: 'test-theme',
          syncWithPreferences: false,
          enableSystem: false,
        });
        // Theme should be loaded from storage on initialization
        // Wait a bit for async initialization
        await new Promise(resolve => setTimeout(resolve, 10));
        expect(newManager.getMode()).toBe('dark');
        newManager.destroy();
      }
    });
  });

  describe('System Theme Detection', () => {
    it('should detect system theme', () => {
      if (typeof window !== 'undefined') {
        const systemTheme = manager.detectSystemTheme();
        expect(['light', 'dark']).toContain(systemTheme);
      }
    });

    it('should handle system theme mode', async () => {
      if (typeof window !== 'undefined') {
        await manager.setTheme('system');
        expect(manager.getMode()).toBe('system');
        expect(manager.isSystem()).toBe(true);
        // Resolved theme should match system preference
        const resolved = manager.getResolvedTheme();
        expect(['light', 'dark']).toContain(resolved);
      }
    });
  });

  describe('Listeners', () => {
    it('should notify listeners on theme change', async () => {
      const listener = vi.fn();
      const unsubscribe = manager.addListener(listener);

      await manager.setTheme('dark');
      expect(listener).toHaveBeenCalledWith('dark', 'dark');

      unsubscribe();
      await manager.setTheme('light');
      // Should not be called after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Color Utilities', () => {
    it('should get color values', () => {
      if (typeof window !== 'undefined') {
        const color = manager.getColor('primary', 'rgb');
        expect(color).toBeTruthy();
        expect(typeof color).toBe('string');
      }
    });

    it('should get chart colors', () => {
      if (typeof window !== 'undefined') {
        const color1 = manager.getChartColor(1);
        const color2 = manager.getChartColor(2);
        expect(color1).toBeTruthy();
        expect(color2).toBeTruthy();
        expect(color1).not.toBe(color2);
      }
    });

    it('should get chart colors with opacity', () => {
      if (typeof window !== 'undefined') {
        const color = manager.getChartColor(1, 0.5);
        expect(color).toContain('rgba');
        expect(color).toContain('0.5');
      }
    });

    it('should get all theme variables', () => {
      if (typeof window !== 'undefined') {
        const variables = manager.getAllVariables();
        expect(variables).toBeTruthy();
        expect(typeof variables).toBe('object');
        expect(Object.keys(variables).length).toBeGreaterThan(0);
      }
    });
  });

  describe('CSS Variable Management', () => {
    it('should set CSS variable', () => {
      if (typeof window !== 'undefined') {
        manager.setVariable('primary', '0.5 0.1 270');
        const value = manager.getColor('primary', 'oklch');
        expect(value).toBeTruthy();
      }
    });
  });
});

