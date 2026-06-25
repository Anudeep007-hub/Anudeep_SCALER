FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Create directories for SQLite database and file uploads with proper permissions
# This is crucial for cloud deployments like Render to ensure the app has write access
RUN mkdir -p /app/database && chmod 777 /app/database
RUN mkdir -p /app/app/api/uploads && chmod 777 /app/app/api/uploads

# Set environment variables
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
