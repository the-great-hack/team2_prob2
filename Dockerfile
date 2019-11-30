FROM node:10-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY data ./data
COPY dist ./dist

CMD ["yarn", "start"]
