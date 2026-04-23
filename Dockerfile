
# Aura OS Enterprise Gateway
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build Vite frontend
RUN npm run build

# Expose Gateway Control Plane port
EXPOSE 3000

# Start in RPC mode
CMD ["npm", "run", "dev"]
