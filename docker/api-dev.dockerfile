FROM node:12

WORKDIR /usr/src/app/server

COPY server .

RUN yarn install

CMD ["yarn", "run", "nodemon", "--watch", "./src", "--ext", "ts,tsx", "--exec", "ts-node", "--files", "./src/index.ts"]
