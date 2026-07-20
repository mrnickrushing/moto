# syntax=docker/dockerfile:1

# ---------- Stage 1: build the React frontend ----------
FROM node:20-bullseye AS frontend
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN yarn install --network-timeout 600000
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
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY backend/requirements-deploy.txt ./
RUN pip install -r requirements-deploy.txt
COPY backend/ ./
COPY --from=frontend /app/frontend/build /app/frontend/build
EXPOSE 8000
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
