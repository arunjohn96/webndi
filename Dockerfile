FROM node:16

COPY ndi/lib/libndi.so.4 /lib/
COPY ndi/lib/libndi.so.4 /lib/libndi.so.4
ENV LD_LIBRARY_PATH=/usr/lib/:/lib/

RUN apt-get update && apt-get install -y \
    libavahi-client-dev \
    libavahi-common3 \
    libnss3-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    avahi-utils \
    iputils-ping \
    avahi-daemon \
    libnss-mdns \
    systemd \
    apt-utils

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm clean-install

COPY . .

CMD ['/etc/init.d/avahi-daemon', 'start']
