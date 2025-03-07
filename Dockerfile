FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./src ./src
COPY ./tsconfig.app.json ./tsconfig.app.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./vite.config.ts ./vite.config.ts

COPY . .

RUN npm run build

FROM nginx:alpine
USER root

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist .

RUN mkdir -p /var/cache/nginx \
    && chmod -R 777 /var/cache/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]