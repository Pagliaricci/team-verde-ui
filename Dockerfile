FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

COPY package*.json ./

RUN npm install

ARG FRONTEND_URL
ARG VITE_BACKEND_URL
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_PASSWORD
ARG VITE_AUTH0_USERNAME

ENV FRONTEND_URL=${FRONTEND_URL}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN}
ENV VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}
ENV VITE_AUTH0_PASSWORD=${VITE_AUTH0_PASSWORD}
ENV VITE_AUTH0_USERNAME=${VITE_AUTH0_USERNAME}

# Build the application
COPY . .
RUN npm run build

# Stage 2: Serve the built files
FROM --platform=linux/amd64 node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist

RUN npm i -g serve

# Expose the port on which the app will run
EXPOSE 5173

# Serve the built frontend
ENTRYPOINT ["serve", "-s", "dist", "-l", "5173"]