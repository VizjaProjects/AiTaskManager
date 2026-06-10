# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json ./
COPY app ./app
COPY assets ./assets
COPY components ./components
COPY lib ./lib
COPY app.json App.tsx babel.config.js global.css index.ts ./
COPY metro.config.js nativewind-env.d.ts tailwind.config.js tsconfig.json ./

ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_API_PREFIX=/api/v1
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_PREFIX=$EXPO_PUBLIC_API_PREFIX

RUN npx expo export --platform web

FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY downloads /usr/share/nginx/html/downloads

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
