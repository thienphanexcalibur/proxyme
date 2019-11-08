#!/bin/bash
// Temporary fix env to Linux to use default node-mitm certificate
platform=$(uname)
set -e
POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    --publicPath)
    PUBLICPATH="$2"
    shift # past argument
    shift # past value
    ;;
    --certDir)
		CERTDIR="$2"
		shift
		shift
		;;
		*)
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

printf "[CERTIFICATE] Detect you are using $platform"


#try/catch bash
{
  if [ $platform == "Linux" ] 
  then
	  certutil -d sql:$HOME/.pki/nssdb -A -t "CT,C,C" -n "PROXYMECERT" -i $CERTDIR
  fi
  if [ $platform == "Darwin" ] 
  then
	  sudo security add-trusted-cert -d -r trustRoot -k $HOME/Library/Keychains/login.keychain $certpath
  fi
  printf "[CERTIFICATE] Certificate added from\n$CERTDIR"
} || {
  printf "[CERTIFICATE] Something wrong while trying to add proxyme certificate"
}


