FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./src ./src
COPY ./tsconfig.app.json ./tsconfig.app.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./vite.config.ts ./vite.config.ts

COPY . .

# 6️⃣ React + Vite 빌드 실행
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]