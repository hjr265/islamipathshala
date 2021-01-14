FROM alpine:3.9

MAINTAINER ridwan@furqansoftware.com

ENV HUGO_VERSION=0.79.1
RUN apk add --update curl wget ca-certificates git nodejs npm python py-pip libsass make
RUN wget --no-check-certificate https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_Linux-64bit.tar.gz && \
  tar xzf hugo_${HUGO_VERSION}_Linux-64bit.tar.gz -C /tmp && \
  rm -r hugo_${HUGO_VERSION}_Linux-64bit.tar.gz && \
  mv /tmp/hugo /usr/bin/hugo && \
  rm -r /tmp/*
RUN pip install s3cmd
RUN npm install gulp -g
RUN apk del wget && \
  rm /var/cache/apk/*