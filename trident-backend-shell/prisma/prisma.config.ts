import { defineConfig } from '@prisma/client/config';

export default defineConfig({
    datasource: {
        db: {
            provider: 'sqlite',
            adapter: 'file:./dev.db',
        },
    },
});
