FROM python:3.10-slim

RUN apt-get update &&     apt-get install -y ffmpeg curl &&     apt-get clean

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENV PORT=5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]