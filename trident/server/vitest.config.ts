import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'c8',
            reporter: ['text', 'lcov'],
            reportsDirectory: './coverage',
            exclude: ['**/node_modules/**', '**/tests/**'],
        },
    },
});
