FROM node:12

WORKDIR /usr/src/app/server

COPY server .

RUN yarn install
RUN yarn global install typescript
RUN mkdir ./dist
RUN tsc --outDir dist/ --project tsconfig.json

CMD ["node", "dist/index.js"]
