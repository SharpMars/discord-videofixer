FROM oven/bun:alpine
WORKDIR /usr/src/app

RUN apk add ffmpeg

COPY index.ts bun.lock package.json ./

RUN bun install --frozen-lockfile
ENTRYPOINT [ "bun", "run", "index.ts" ]