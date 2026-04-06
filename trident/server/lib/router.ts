// router.ts

export type HttpMethod =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE'
    | 'HEAD'
    | 'ALL';

export type Handler = (req: any, res: any, next: (err?: any) => void) => void;

// Example middleware: logging
export const loggingMiddleware: Handler = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};

// Example middleware: CORS
export const corsMiddleware: Handler = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }
    next();
};

interface Layer {
    method: HttpMethod;
    path: string;
    handlers: Handler[];
    paramNames?: string[];
    paramRegex?: RegExp;
}

// ---
// Usage Example: Using this router as Express middleware
//
// import express from 'express';
// import { Router } from './router';
// import enginesRouter from './engines';
//
// const app = express();
//
// // Add any Express middleware here (body-parser, etc.)
//
// // Use the custom router as Express middleware
// app.use(enginesRouter.asExpressMiddleware());
//
// app.listen(3000);

export class Router {
    private stack: Layer[] = [];


    use(pathOrHandler: string | Handler, ...handlers: Handler[]): this {
        if (typeof pathOrHandler === 'function') {
            this.stack.push({
                method: 'ALL',
                path: '/',
                handlers: [pathOrHandler, ...handlers],
            });
        } else if (handlers.length > 0) {
            this.stack.push({
                method: 'ALL',
                path: pathOrHandler,
                handlers: handlers,
                ...this._parsePath(pathOrHandler),
            });
        }
        return this;
    }


    add(method: HttpMethod, path: string, ...handlers: Handler[]): this {
        this.stack.push({
            method,
            path,
            handlers,
            ...this._parsePath(path),
        });
        return this;
    }


    get(path: string, ...handlers: Handler[]) {
        return this.add('GET', path, ...handlers);
    }

    post(path: string, ...handlers: Handler[]) {
        return this.add('POST', path, ...handlers);
    }

    put(path: string, ...handlers: Handler[]) {
        return this.add('PUT', path, ...handlers);
    }

    delete(path: string, ...handlers: Handler[]) {
        return this.add('DELETE', path, ...handlers);
    }

    // add others as needed: put, delete, etc.

    // Express middleware compatibility
    asExpressMiddleware(): (req: any, res: any, next: (err?: any) => void) => void {
        return (req, res, next) => {
            this.handle(req, res, (err?: any) => {
                if (err) return next(err);
                // If response not sent, call next()
                if (!res.headersSent) next();
            });
        };
    }

    handle = (req: any, res: any, out: (err?: any) => void) => {
        let idx = 0;
        const method = (req.method || 'GET').toUpperCase();
        req.params = {};

        const next = (err?: any) => {
            if (err) return out(err);
            if (idx >= this.stack.length) return out();

            const layer = this.stack[idx++];
            const methodMatches =
                layer.method === 'ALL' || layer.method === (method as HttpMethod);

            let pathMatches = false;
            let params: Record<string, string> = {};
            if (layer.paramRegex) {
                const match = layer.paramRegex.exec(req.url);
                if (match) {
                    pathMatches = true;
                    layer.paramNames?.forEach((name, i) => {
                        params[name] = match[i + 1];
                    });
                }
            } else {
                pathMatches = layer.path === '/' || layer.path === req.url || req.url.startsWith(layer.path + '/');
            }

            if (!methodMatches || !pathMatches) {
                return next();
            }

            if (Object.keys(params).length > 0) {
                req.params = params;
            }

            let handlerIdx = 0;
            const runHandlers = (handlerErr?: any) => {
                if (handlerErr) return out(handlerErr);
                if (handlerIdx >= layer.handlers.length) return next();
                try {
                    layer.handlers[handlerIdx++](req, res, runHandlers);
                } catch (e) {
                    out(e);
                }
            };
            runHandlers();
        };

        next();
    };

    // Internal: parse path for params (e.g., /user/:id)
    private _parsePath(path: string): { paramNames?: string[]; paramRegex?: RegExp } {
        if (!path.includes(':')) return {};
        const paramNames: string[] = [];
        // Convert /user/:id/profile/:section to /user/([^/]+)/profile/([^/]+)
        const regexStr = path.replace(/:([^/]+)/g, (_, name) => {
            paramNames.push(name);
            return '([^/]+)';
        });
        return {
            paramNames,
            paramRegex: new RegExp('^' + regexStr + '$'),
        };
    }
}
