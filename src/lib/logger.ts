/**
 * Structured Logging Utility
 * Ensures logs are JSON formatted for production observability
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, any>;
    error?: any;
}

function log(level: LogLevel, message: string, context?: Record<string, any>, error?: any) {
    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context,
    };

    if (error) {
        entry.error = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    }

    // In development, pretty print
    if (process.env.NODE_ENV === 'development') {
        const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m';
        console.log(`${color}[${level.toUpperCase()}] ${message}\x1b[0m`, context || '', error || '');
    } else {
        // Production: JSON stringify for log collectors (DataDog, CloudWatch, Vercel Logs)
        console.log(JSON.stringify(entry));
    }
}

export const logger = {
    info: (message: string, context?: Record<string, any>) => log('info', message, context),
    warn: (message: string, context?: Record<string, any>) => log('warn', message, context),
    error: (message: string, error?: any, context?: Record<string, any>) => log('error', message, context, error),
    debug: (message: string, context?: Record<string, any>) => log('debug', message, context),
};
