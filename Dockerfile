# Stage de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build l'application
RUN npm run build

# Stage de production
FROM node:20-alpine AS runner

WORKDIR /app

# Copier les fichiers nécessaires depuis le stage de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
