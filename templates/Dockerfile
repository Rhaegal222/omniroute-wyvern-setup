FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ patch sqlite3 wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ARG OMNIROUTE_VERSION=3.8.51
ARG OPENCODE_OMNIROUTE_AUTH_VERSION=1.2.2
RUN npm install "omniroute@${OMNIROUTE_VERSION}" "opencode-omniroute-auth@${OPENCODE_OMNIROUTE_AUTH_VERSION}"

COPY patches/auto-excluded-models.patch /tmp/auto-excluded-models.patch
RUN patch -p1 < /tmp/auto-excluded-models.patch

COPY scripts/start-with-secrets.mjs /app/start-with-secrets.mjs

EXPOSE 20128

ENTRYPOINT ["node", "/app/start-with-secrets.mjs"]
CMD ["npx", "omniroute", "serve", "--no-open", "--port", "20128"]
