#!/bin/bash
platform=$(uname)
if [ $platform=="Linux" ]
then
	gsettings set org.gnome.system.proxy mode 'none'
	gsettings set org.gnome.system.proxy autoconfig-url ''
	certutil -d sql:$HOME/.pki/nssdb -D -n PROXYMECERT
fi
if [ $platform == 'Darwin' ]
then
	 networksetup -setautoproxystate "Wi-Fi" off
fi
