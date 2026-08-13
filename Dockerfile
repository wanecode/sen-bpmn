# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22-bookworm-slim
ARG SITE_URL=http://localhost:3000

FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM node:${NODE_VERSION} AS builder
ARG SITE_URL
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    SITE_URL=${SITE_URL} \
    NEXT_PUBLIC_SITE_URL=${SITE_URL}
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run generate:bpmn \
  && npm run check:bpmn \
  && npm run build

FROM node:${NODE_VERSION} AS runner
ARG SITE_URL
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    SITE_URL=${SITE_URL} \
    NEXT_PUBLIC_SITE_URL=${SITE_URL} \
    SEN_BPMN_STORAGE=sqlite \
    SEN_BPMN_DATA_DIR=/app/data \
    SEN_BPMN_BPMN_DIR=/app/content/bpmn

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --home-dir /app nextjs \
  && mkdir -p /app/data /app/content/bpmn \
  && chown -R nextjs:nodejs /app

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/data/bpmn ./content/bpmn

USER nextjs
EXPOSE 3000
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/sante').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]

CMD ["node", "server.js"]
