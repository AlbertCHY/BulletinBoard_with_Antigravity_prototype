FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code to /app/backend (since context is ./backend)
COPY . /app/backend

# Set PYTHONPATH to /app so "from backend.app import ..." works
ENV PYTHONPATH=/app

# Create data directory for persistence
RUN mkdir -p /data

# Run uvicorn (:app is the name of fastapi parameter in main.py)
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
