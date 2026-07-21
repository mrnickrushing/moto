# syntax=docker/dockerfile:1

# ---------- Stage 1: build the React frontend ----------
FROM node:24-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000
COPY frontend/ ./
# Same-origin API: empty base URL makes the app call "/api" relative to its own host.
ARG REACT_APP_SENTRY_DSN=""
ARG RAILWAY_GIT_COMMIT_SHA=""
ARG REACT_APP_SENTRY_RELEASE=${RAILWAY_GIT_COMMIT_SHA}
ENV REACT_APP_BACKEND_URL=""
ENV REACT_APP_SENTRY_DSN=${REACT_APP_SENTRY_DSN}
ENV REACT_APP_SENTRY_ENVIRONMENT=production
ENV REACT_APP_SENTRY_RELEASE=${REACT_APP_SENTRY_RELEASE}
ENV CI=false
ENV NODE_ENV=production
RUN yarn build

# ---------- Stage 2: Python runtime that serves API + built frontend ----------
FROM python:3.11-slim@sha256:db3ff2e1800a8581e2c48a27c3995339d47bdf046da21c7627accd3d51053a93 AS runtime
WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    ENVIRONMENT=production
COPY backend/requirements-deploy.txt ./
RUN pip install -r requirements-deploy.txt
RUN addgroup --system app && adduser --system --ingroup app app
COPY --chown=app:app backend/ ./
COPY --from=frontend --chown=app:app /app/frontend/build /app/frontend/build
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD ["python", "-c", "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:' + os.environ.get('PORT', '8000') + '/api/', timeout=3)"]
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000} --no-server-header --no-access-log"]
