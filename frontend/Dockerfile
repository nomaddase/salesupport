FROM node:20-alpine

ENV npm_config_fetch_timeout=120000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retries=5 \
    npm_config_registry=https://registry.npmjs.org/ \
    npm_config_network_timeout=120000

WORKDIR /app

COPY package.json package-lock.json ./
RUN set -eux; \
    npm config set fetch-retry-mintimeout "$npm_config_fetch_retry_mintimeout"; \
    npm config set fetch-retry-maxtimeout "$npm_config_fetch_retry_maxtimeout"; \
    npm config set fetch-timeout "$npm_config_fetch_timeout"; \
    npm config set network-timeout "$npm_config_network_timeout"; \
    for attempt in 1 2 3; do \
        npm ci --no-audit --progress=false && break; \
        echo "npm ci attempt ${attempt} failed, retrying..."; \
        if [ "${attempt}" = "3" ]; then exit 1; fi; \
        sleep 5; \
    done

COPY . .

RUN npm run build

CMD ["npm", "run", "dev"]
