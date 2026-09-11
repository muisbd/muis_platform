FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/src ./src

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/server.js"]
