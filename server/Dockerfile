# Debian-slim (glibc) so the standalone yt-dlp binary runs. yt-dlp powers
# YouTube stream resolution (robust to YouTube's frequent player changes).
FROM node:20-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates wget \
  && wget -q -O /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux \
  && chmod +x /usr/local/bin/yt-dlp \
  && apt-get purge -y wget && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies first (better layer caching)
COPY package.json ./
RUN npm install --omit=dev

# App source
COPY src ./src

ENV PORT=8787
EXPOSE 8787

CMD ["node", "src/index.js"]
