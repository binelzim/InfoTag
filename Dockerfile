FROM node:22-bookworm-slim AS frontend-build
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/index.html frontend/vite.config.js ./
COPY frontend/src ./src
RUN npm run build

FROM python:3.13-slim-bookworm
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt \
    && useradd --system --no-create-home infotag
COPY backend/app.py backend/demo.py ./backend/
COPY --from=frontend-build /build/dist ./frontend/dist
USER infotag
EXPOSE 10000
CMD ["sh", "-c", "exec gunicorn --chdir backend --bind 0.0.0.0:${PORT:-10000} --workers 1 --threads 4 --timeout 45 --no-control-socket app:app"]
