import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState<boolean>(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('theme');
            if (stored) {
                const dark = stored === 'dark';
                setIsDark(dark);
                document.documentElement.classList.toggle('dark', dark);
            } else if (window.matchMedia) {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setIsDark(prefersDark);
                document.documentElement.classList.toggle('dark', prefersDark);
            }
        } catch {
            // localStorage may be unavailable in some contexts; fail silently
        }
    }, []);

    function toggleTheme() {
        setIsDark((prev) => {
            const next = !prev;
            try {
                document.documentElement.classList.toggle('dark', next);
                localStorage.setItem('theme', next ? 'dark' : 'light');
            } catch {
                // ignore
            }
            return next;
        });
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-1 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
            {isDark ? (
                // Sun icon for light mode
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M10 3.22l.61 1.77a1 1 0 00.95.69h1.86l-1.5 1.09a1 1 0 00-.36 1.09l.61 1.77-1.5-1.09a1 1 0 00-1.18 0l-1.5 1.09.61-1.77a1 1 0 00-.36-1.09L6.58 5.68h1.86a1 1 0 00.95-.69L10 3.22z" />
                    <path d="M10 0a1 1 0 011 1v1a1 1 0 01-2 0V1a1 1 0 011-1zM10 17a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zM3.22 6.58a1 1 0 011.09.36l.61 1.77-1.5-1.09a1 1 0 00-1.18 0L3.22 6.58zM16.78 13.42a1 1 0 01-1.09-.36l-.61-1.77 1.5 1.09a1 1 0 001.18 0l-1.98 1.04zM0 10a1 1 0 011-1h1a1 1 0 010 2H1a1 1 0 01-1-1zM17 10a1 1 0 011-1h1a1 1 0 010 2h-1a1 1 0 01-1-1zM3.22 13.42l1.98-1.04-1.5 1.09a1 1 0 00-1.18 0l.7-.05zM16.78 6.58l-1.98 1.04 1.5-1.09a1 1 0 001.18 0l-.7.05z" />
                </svg>
            ) : (
                // Moon icon for dark mode
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M17.293 13.293A8 8 0 116.707 2.707a7 7 0 0010.586 10.586z" />
                </svg>
            )}
        </button>
    );
}
