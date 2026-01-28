FROM node:25-alpine

RUN mkdir /app
WORKDIR /app

ENV PORT=3001
EXPOSE 3001

COPY package.json package.json
RUN npm install --only=prod --no-audit

COPY dist .

CMD ["node", "."]
