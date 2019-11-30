FROM node:10-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY .env ./
COPY dist ./dist

CMD ["node", "dist/main.js"]
