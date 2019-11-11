#!/bin/bash
platform=$(uname)
POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -p|--pac)
    PAC="$2"
    shift # past argument
    shift # past value
    ;;
    *)
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
if [ $platform=="Linux" ]
then
set -- "${POSITIONAL[@]}" # restore positional parameters
gsettings set org.gnome.system.proxy autoconfig-url "${PAC}"
gsettings set org.gnome.system.proxy mode 'auto'
fi
if [ $platform == "Darwin" ]
then
	networksetup -setautoproxyurl "Wi-Fi" $PAC
fi

