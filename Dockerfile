FROM node:10.15.3

MAINTAINER George

ADD . /vote-system

RUN cd /vote-system && npm install
