FROM node:20-alpine

ENV npm_config_fetch_timeout=120000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retries=5 \
    npm_config_registry=https://registry.npmjs.org/ \
    npm_config_network_timeout=120000

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --progress=false

COPY . .

RUN npm run build

CMD ["npm", "run", "dev"]
