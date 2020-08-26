FROM node:12

WORKDIR /usr/src/app/server

COPY server/package.json .

RUN yarn install

COPY server .

CMD ["yarn", "run", "nodemon", "-L", "--watch", "./src", "--ext", "ts,tsx", "--exec", "ts-node", "--files", "./src/index.ts"]
