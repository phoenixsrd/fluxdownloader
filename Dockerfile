FROM python:3.11

RUN apt update && apt install -y ffmpeg zip

WORKDIR /app
COPY . .

RUN pip install -r requirements.txt

CMD ["python", "app.py"]