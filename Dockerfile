# syntax=docker/dockerfile:1
# https://github.com/docker/docs/issues/20935

FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml .

RUN npm install -g pnpm@latest-10
RUN pnpm install

COPY . .

# https://docs.docker.com/build/building/secrets/
RUN --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN \
	pnpm run build

ENV NODE_ENV=production
ENV NEXT_PUBLIC_ENV=production

EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]
