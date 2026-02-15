FROM node:20-alpine

WORKDIR /app

# Install build tools for bcrypt and nodemon for hot-reload
RUN apk add --no-cache python3 make g++ \
    && npm install -g nodemon

COPY package*.json ./

RUN npm install

# Don't copy . here because we'll use volume mount for hot-reload
# COPY . .

EXPOSE 3000

# Use nodemon for hot-reload in development
CMD ["npm", "run", "dev"]
