FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

CMD npx prisma generate && npx prisma db push --accept-data-loss && npx prisma db seed && npm start
