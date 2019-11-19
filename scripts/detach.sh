#!/bin/bash
platform=$(uname)
if [ $platform=="Linux" ]
then
	export http_proxy=""
	export https_proxy=""
	certutil -d sql:$HOME/.pki/nssdb -D -n PROXYMECERT
fi
if [ $platform == 'Darwin' ]
then
	 networksetup -setautoproxystate "Wi-Fi" off
fi
