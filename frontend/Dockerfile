FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

COPY . .

# Skip build for dev mode isolation
# RUN pnpm run build

EXPOSE 8080

# Run Next.js in dev mode on port 8080 binding to all interfaces
CMD ["npx", "next", "dev", "-p", "8080", "-H", "0.0.0.0"]
