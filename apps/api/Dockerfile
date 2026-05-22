FROM node:24-alpine

WORKDIR /workspace

COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm install

COPY . .

RUN npm run build --workspace @chess-ledger/shared

EXPOSE 3000

CMD ["npm", "run", "start:dev", "--workspace", "@chess-ledger/api"]
