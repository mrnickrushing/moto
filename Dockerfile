# syntax=docker/dockerfile:1

# ---------- Stage 1: build the React frontend ----------
FROM node:20-bullseye AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000
COPY frontend/ ./
# Same-origin API: empty base URL makes the app call "/api" relative to its own host.
ENV REACT_APP_BACKEND_URL=""
ENV CI=false
ENV NODE_ENV=production
RUN yarn build

# ---------- Stage 2: Python runtime that serves API + built frontend ----------
FROM python:3.11-slim AS runtime
WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
COPY backend/requirements-deploy.txt ./
RUN pip install -r requirements-deploy.txt
RUN addgroup --system app && adduser --system --ingroup app app
COPY --chown=app:app backend/ ./
COPY --from=frontend --chown=app:app /app/frontend/build /app/frontend/build
USER app
EXPOSE 8000
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
