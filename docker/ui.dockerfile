FROM node:12 AS build

WORKDIR /usr/src/app/client

COPY client .

RUN yarn install
RUN yarn build

FROM nginx

COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY docker/ui-nginx.conf /etc/nginx/conf.d/default.conf
