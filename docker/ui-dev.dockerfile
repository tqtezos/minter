FROM node:12

WORKDIR /usr/src/app/client

COPY client ./

RUN yarn install

CMD ["yarn", "start"]
