import * as Sentry from "@sentry/react";

const dsn = process.env.REACT_APP_SENTRY_DSN?.trim();

function publicUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname.replace(
      /\/api\/payments\/status\/[^/]+/,
      "/api/payments/status/[redacted]",
    );
    return url.toString();
  } catch {
    return "[redacted-url]";
  }
}

function scrubEvent(event) {
  delete event.user;
  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;
    delete event.request.headers;
    delete event.request.query_string;
    if (event.request.url) event.request.url = publicUrl(event.request.url);
  }
  for (const breadcrumb of event.breadcrumbs || []) {
    if (!breadcrumb.data) continue;
    delete breadcrumb.data.request_body;
    delete breadcrumb.data.response_body;
    delete breadcrumb.data.headers;
    if (breadcrumb.data.url) breadcrumb.data.url = publicUrl(breadcrumb.data.url);
  }
  return event;
}

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.REACT_APP_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.REACT_APP_SENTRY_RELEASE || undefined,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: scrubEvent,
  });
}

export const sentryRootOptions = dsn
  ? {
      onUncaughtError: Sentry.reactErrorHandler(),
      onCaughtError: Sentry.reactErrorHandler(),
      onRecoverableError: Sentry.reactErrorHandler(),
    }
  : {};
