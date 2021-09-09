FROM node:14 AS base

RUN mkdir -p /srv/demo && chown -R node:node /srv/demo

USER node

WORKDIR /srv/demo

COPY --chown=node:node package.json package-lock.json ./

RUN npm install --quiet --production

#
# development
#
FROM base AS development

WORKDIR /srv/demo

RUN npm install --quiet

COPY --chown=node:node . .

CMD ["npx", "nodemon", "server.js"]

#
# production
#
FROM node:14-slim AS production

WORKDIR /srv/demo

COPY --from=base --chown=root:root /srv/demo/node_modules ./node_modules

COPY . .

CMD ["node", "server.js"]
