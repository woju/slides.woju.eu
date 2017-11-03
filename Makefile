ROOT = /var/www/slides.woju.eu

all:
	lektor build -O $(ROOT)/html
	install -t $(ROOT)/cgi-bin cgi-bin/*
.PHONY: all
