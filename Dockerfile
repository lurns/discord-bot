### BUILDER STAGE ###
FROM node:24-alpine AS builder 

WORKDIR /app 

COPY package*.json ./ 

RUN npm ci --omit=dev 

COPY . . 

### PRODUCTION STAGE ###
FROM node:24-alpine AS prod 

# Install Chromium & required dependencies 
RUN apk add --no-cache \ 
  chromium \ 
  nss \ 
  freetype \ 
  harfbuzz \ 
  ca-certificates \ 
  ttf-freefont \ 
  bash 

# Puppeteer config
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser 

WORKDIR /app 

COPY --from=builder /app /app 

ENV NODE_ENV=production 
ENV TZ=America/Chicago 

CMD ["npm", "start"]