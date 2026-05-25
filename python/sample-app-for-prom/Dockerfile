FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY gauge_metric.py .

EXPOSE 5000

CMD ["python", "gauge_metric.py"]
