FROM node:20-alpine

ENV npm_config_fetch_timeout=120000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_registry=https://registry.npmjs.org/

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --progress=false

COPY . .

RUN npm run build

CMD ["npm", "run", "dev"]
