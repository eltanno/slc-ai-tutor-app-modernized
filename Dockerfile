FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    git curl wget unzip software-properties-common postgresql-client

RUN add-apt-repository ppa:deadsnakes/ppa && apt-get update
RUN apt-get install -y python3.11 python3-pip python3-venv libkrb5-dev python-is-python3

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

RUN mkdir /app
WORKDIR /app

# fronend
RUN mkdir /app/frontend
WORKDIR /app/frontend
COPY ./frontend/package.* /app/frontend/
RUN npm install
COPY ./frontend /app/frontend
RUN npm run build

#backend
WORKDIR /app
COPY ./backend /app/

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN python3 -m venv .venv && . .venv/bin/activate

RUN . .venv/bin/activate && python -m pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

WORKDIR /app
CMD ["/app/entrypoint.sh"]
