import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext'

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value }),
        removeItem: vi.fn((key: string) => { delete store[key] }),
        clear: vi.fn(() => { store = {} }),
    }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

describe('ThemeContext', () => {
    beforeEach(() => {
        localStorageMock.clear()
        document.documentElement.classList.remove('dark')
    })

    it('should initialize with light mode by default', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        )

        const { result } = renderHook(() => useTheme(), { wrapper })

        expect(result.current.isDarkMode).toBe(false)
        expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should initialize with dark mode if saved in localStorage', () => {
        localStorageMock.setItem('kaizenhub_theme', 'dark')
        document.documentElement.classList.add('dark')

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        )

        const { result } = renderHook(() => useTheme(), { wrapper })

        expect(result.current.isDarkMode).toBe(true)
    })

    it('should toggle dark mode and update DOM', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        )

        const { result } = renderHook(() => useTheme(), { wrapper })

        expect(result.current.isDarkMode).toBe(false)

        act(() => {
            result.current.toggleDarkMode()
        })

        expect(result.current.isDarkMode).toBe(true)
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(localStorageMock.setItem).toHaveBeenCalledWith('kaizenhub_theme', 'dark')
    })

    it('should toggle back to light mode', () => {
        document.documentElement.classList.add('dark')
        localStorageMock.setItem('kaizenhub_theme', 'dark')

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        )

        const { result } = renderHook(() => useTheme(), { wrapper })

        act(() => {
            result.current.toggleDarkMode()
        })

        expect(result.current.isDarkMode).toBe(false)
        expect(document.documentElement.classList.contains('dark')).toBe(false)
        expect(localStorageMock.setItem).toHaveBeenCalledWith('kaizenhub_theme', 'light')
    })
})
