FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY http_server_app.py .

EXPOSE 5000

CMD ["python", "http_server_app.py"]
