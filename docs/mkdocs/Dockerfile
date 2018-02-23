FROM python:3-alpine

RUN pip install mkdocs
RUN pip install markdown-include

WORKDIR /mkdocs

CMD [ "mkdocs", "build" ]