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
export http_proxy="${PAC}"
export https_proxy="${PAC}"
fi
if [ $platform == "Darwin" ]
then
	networksetup -setautoproxyurl "Wi-Fi" $PAC
fi

