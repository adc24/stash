# Multi-stage: build React, then serve via Flask + gunicorn.
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    STASH_DB_PATH=/data/stash.db \
    PORT=5000

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install -r backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend /app/frontend/dist ./frontend/dist

RUN mkdir -p /data
VOLUME ["/data"]
EXPOSE 5000
WORKDIR /app/backend
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
