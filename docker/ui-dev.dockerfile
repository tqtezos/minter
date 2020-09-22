FROM node:12

WORKDIR /usr/src/app/client

COPY client/package.json .

RUN yarn install

COPY client .
COPY config ./src/config/common

CMD ["yarn", "start"]
