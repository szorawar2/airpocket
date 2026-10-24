# ---- Base ----
FROM node:24-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ---- Runtime ----
FROM base AS runner
ENV NODE_ENV=production

# Required for Next.js
ENV PORT=3000
EXPOSE 3000

# Copy only what we need
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

# Runtime folders
RUN mkdir -p /app/pocket_files

CMD ["npm", "start"]
