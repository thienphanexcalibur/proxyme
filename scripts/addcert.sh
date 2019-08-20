#!/bin/bash
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

# set certificate path
certpath="${PUBLICPATH}/.http-mitm-proxy/certs/ca.pem"

#try/catch bash
{
  certutil -d sql:$HOME/.pki/nssdb -A -t "CT,C,C" -n "PROXYMECERT" -i $certpath
  printf "[CERTIFICATE] Certificate added from\n${certpath}"
} || {
  printf "[CERTIFICATE] Something wrong while trying to add proxyme certificate"
}


