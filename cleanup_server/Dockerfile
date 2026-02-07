FROM node:20

WORKDIR /app

COPY cleanup_server/package*.json ./
RUN npm install

COPY cleanup_server .

CMD ["node", "index.js"]
