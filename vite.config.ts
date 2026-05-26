import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
    optimizeDeps: {
        exclude: ['jeep-sqlite'],
    },
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
        middlewareMode: false,
    },
    plugins: [
        {
            name: 'wasm-middleware',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url?.endsWith('.wasm')) {
                        const wasmPath = path.join(
                            process.cwd(),
                            'node_modules/sql.js/dist/sql-wasm.wasm'
                        );
                        if (fs.existsSync(wasmPath)) {
                            res.setHeader('Content-Type', 'application/wasm');
                            fs.createReadStream(wasmPath).pipe(res);
                            return;
                        }
                    }
                    next();
                });
            },
        },
    ],
});