# syntax=docker/dockerfile:1

FROM node:22.23.4-alpine3.24 AS build

WORKDIR /app
RUN chown node:node /app
COPY --chown=node:node package.json package-lock.json ./

USER node
RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 npm ci

COPY --chown=node:node . .

ARG VITE_API_URL=/api
ARG VITE_AUTH_URL=/auth
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_AUTH_URL=${VITE_AUTH_URL} \
    VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.30.4-alpine3.24 AS runtime

LABEL org.opencontainers.image.source="https://github.com/ARamosA0/trading_journal"

COPY --from=build --chown=101:101 /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
