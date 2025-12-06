import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',

  // Performance monitoring - Integrations are automatically included in Sentry v7+
  // Http tracing, Express, and error handlers are included by default

  // Custom error filtering
  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      
      // Don't send database connection errors in development
      if (process.env.NODE_ENV === 'development' && 
          error instanceof Error && 
          error.message.includes('ECONNREFUSED')) {
        return null;
      }

      // Don't send validation errors
      if (error instanceof Error && 
          (error.message.includes('validation') || 
           error.message.includes('required'))) {
        return null;
      }
    }

    return event;
  },

  // Custom tags
  initialScope: {
    tags: {
      component: 'server',
    },
  },

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Custom context
  beforeBreadcrumb(breadcrumb) {
    // Filter out sensitive data
    if (breadcrumb.category === 'http' && breadcrumb.data) {
      delete breadcrumb.data.body;
      delete breadcrumb.data.cookies;
      delete breadcrumb.data.authorization;
    }
    return breadcrumb;
  },
});
