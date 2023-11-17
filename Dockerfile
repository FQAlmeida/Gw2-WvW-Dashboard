FROM oven/bun
WORKDIR /app
COPY package.json package.json
# COPY bun.lockb bun.lockb
RUN bun install
COPY . .
RUN bun run build
EXPOSE 3000
ENTRYPOINT ["bun", "./build"]
