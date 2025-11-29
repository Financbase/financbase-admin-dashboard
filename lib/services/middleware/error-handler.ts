/**
 * Error Handler Middleware
 * Stub file for user-profile.service
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public context?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

