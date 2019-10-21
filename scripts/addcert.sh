#!/bin/bash
platform=$(uname)
set -e
POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -path|--publicPath)
    PUBLICPATH="$2"
    shift # past argument
    shift # past value
    ;;
    *)
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

printf "[CERTIFICATE] Detect you are using $platform"

# set certificate path - Linux only
certpath="${PUBLICPATH}/.http-mitm-proxy/certs/ca.pem"

#try/catch bash
{
  if [ $platform == "Linux" ] 
  then
	  certutil -d sql:$HOME/.pki/nssdb -A -t "CT,C,C" -n "PROXYMECERT" -i $certpath
  fi
  if [ $platform == "Darwin" ] 
  then
	  sudo security add-trusted-cert -d -r trustRoot -k $HOME/Library/Keychains/login.keychain $certpath
  fi
  printf "[CERTIFICATE] Certificate added from\n${certpath}"
} || {
  printf "[CERTIFICATE] Something wrong while trying to add proxyme certificate"
}


