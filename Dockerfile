FROM node:12.10.0 As build

WORKDIR /home/node/app
COPY . .
RUN npm install && npm run build

FROM node:alpine

COPY --from=build /home/node/app /app/

ENV PRIVATE_KEY=
ENV RPC=

CMD ["node", "/app/dist/index.js"]
