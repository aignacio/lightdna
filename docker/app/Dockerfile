FROM ubuntu
MAINTAINER Ânderson Ignácio da Silva, anderson@aignacio.com

RUN \
   apt-get update && \
   apt-get install -y nodejs-legacy

# Install software 
RUN apt-get install -y git
# Make ssh dir
RUN mkdir /root/.ssh/

# Copy over private key, and set permissions
ADD id_rsa /root/.ssh/id_rsa

# Create known_hosts
RUN touch /root/.ssh/known_hosts
# Add bitbuckets key
RUN ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

# Clone the conf files into the docker container
RUN git clone git@bitbucket.org:aignaciodasilva/lightdnav2.git 

VOLUME ["/data/db"]
WORKDIR /data

EXPOSE 80

CMD [""]
