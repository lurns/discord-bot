### BUILDER STAGE ###
FROM node:24-alpine AS builder 

WORKDIR /app 

COPY package*.json ./ 

RUN npm ci --omit=dev 

COPY . . 

### PRODUCTION STAGE ###
FROM node:24-alpine AS prod 

WORKDIR /app 

COPY --from=builder /app /app 

ENV NODE_ENV=production 
ENV TZ=America/Chicago 

CMD ["npm", "start"]