FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src
COPY config ./config

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
