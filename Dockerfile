# Etapa 1: Construcción
FROM node:20.4-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npx prisma generate --schema ./prisma/schema.prisma

# Etapa 2: Producción
FROM node:20.4-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/deploy.sh ./deploy.sh
RUN chmod +x deploy.sh
EXPOSE 3000
CMD ["./.github/scripts/prisma.sh"]