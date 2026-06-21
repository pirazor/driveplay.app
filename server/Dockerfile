FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json ./
RUN npm install --omit=dev

# App source
COPY src ./src

ENV PORT=8787
EXPOSE 8787

CMD ["node", "src/index.js"]
