# Build Stage
FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json* ./

# Uncomment the line below if building behind a corporate proxy with self-signed certificates
# RUN npm config set strict-ssl false

RUN npm install

# Copy source code
COPY . .

RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy build artifacts
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
