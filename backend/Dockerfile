FROM ubuntu:18.04
RUN apt-get update \
&& apt-get install -y python3-pip python3-dev
WORKDIR /src/backend
COPY requirements.txt /src/backend
RUN pip3 install -r requirements.txt
COPY . /src/backend
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]