import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  
  // Performance monitoring - BrowserTracing is automatically included in Sentry v7+
  // Trace propagation targets for performance monitoring
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/yourserver\.io\/api/,
    /^https:\/\/api\.financbase\.com/,
  ],

  // Custom error filtering
  beforeSend(event, hint) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      // Don't send network errors
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof TypeError && error.message.includes('fetch')) {
          return null;
        }
      }
    }
    return event;
  },

  // Custom tags
  initialScope: {
    tags: {
      component: 'client',
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
    }
    return breadcrumb;
  },
});
