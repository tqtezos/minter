FROM node:12

WORKDIR /usr/src/app/server

COPY server/package.json server/yarn.lock ./

RUN yarn install --frozen-lockfile

COPY server .

CMD ["yarn", "run", "nodemon", "-L", "--watch", "./src", "--ext", "ts,tsx", "--exec", "ts-node", "--files", "./src/index.ts"]
