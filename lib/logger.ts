/**
 * Simple logging utility for the application
 * Provides consistent logging format and levels
 */

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

export class Logger {
	private static instance: Logger;
	private static currentLogLevel: LogLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;

	private constructor() {}

	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	private shouldLog(level: LogLevel): boolean {
		return level >= Logger.currentLogLevel;
	}

	private formatMessage(level: string, message: string, data?: any): string {
		const timestamp = new Date().toISOString();
		const formattedData = data ? ` ${JSON.stringify(data)}` : '';
		return `[${timestamp}] ${level.toUpperCase()}: ${message}${formattedData}`;
	}

	debug(message: string, data?: any): void {
		if (this.shouldLog(LogLevel.DEBUG)) {
			console.debug(this.formatMessage('debug', message, data));
		}
	}

	info(message: string, data?: any): void {
		if (this.shouldLog(LogLevel.INFO)) {
			console.info(this.formatMessage('info', message, data));
		}
	}

	warn(message: string, data?: any): void {
		if (this.shouldLog(LogLevel.WARN)) {
			console.warn(this.formatMessage('warn', message, data));
		}
	}

	error(message: string, data?: any): void {
		if (this.shouldLog(LogLevel.ERROR)) {
			console.error(this.formatMessage('error', message, data));
		}
	}
}

// Export a singleton instance
export const logger = Logger.getInstance();
