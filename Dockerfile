# Etapa 1: Construcción
FROM node:20.4-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG ORIGIN_URL
ENV ORIGIN_URL=$ORIGIN_URL
RUN npx prisma generate --schema ./prisma/schema.prisma
RUN npm run build

# Etapa de producción
FROM node:20.9.0-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/package-lock.json ./
COPY --from=builder --chown=appuser:appgroup /app/.next ./.next
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=builder --chown=appuser:appgroup /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=appuser:appgroup /app/.github/scripts/prisma.sh ./prisma.sh
RUN npm ci --omit=dev && npm cache clean --force && rm -rf /tmp/* /root/.npm
RUN chmod +x prisma.sh
USER appuser
EXPOSE 3000
CMD ["sh", "prisma.sh"]