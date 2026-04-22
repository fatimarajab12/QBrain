type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface Logger {
  error: (message: string, error?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
}

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

const shouldLog = (level: LogLevel): boolean => {
  if (isProduction) {
    return level === 'error';
  }
  return true;
};

export const logger: Logger = {
  error: (message: string, error?: unknown) => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
  
  warn: (message: string, data?: unknown) => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, data);
    }
  },
  
  info: (message: string, data?: unknown) => {
    if (shouldLog('info')) {
      console.info(`[INFO] ${message}`, data);
    }
  },
  
  debug: (message: string, data?: unknown) => {
    if (shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
};

