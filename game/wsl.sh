#!/bin/bash
#Change hostname for wsl users

printf "This script has to restore ./scripts/client.mjs to the working tree.\nDo you want to continue? (y/n)\n"
read prompt
if [ $prompt = y ]; then
    :
elif [ $prompt = n ]; then
    printf "Exiting\n"
    exit 1
else exit 1 
fi
git restore ./scripts/client.mjs

getip(){
    ifconfig | grep inet | sed -e '2,4d' -e 's/  netmask/\n\t  netmask/' -e 's/broadcast/\n\tbroadcast/' | sed -e '2,3d' -e 's/        inet //' > ./tmp-ip.txt
    ip=$(cat ./tmp-ip.txt)
    rm ./tmp-ip.txt
}

getip
printf "WSL hostname: ${ip}"

changeip(){
    sed -i "s,window.location.hostname,\"${ip}\"," ./scripts/client.mjs
    grep "var myHostname" ./scripts/client.mjs > changedip.txt; sed -i 's/[^0-9.]//g' changedip.txt 
    changedip=$(cat changedip.txt)
    rm ./changedip.txt
}

sleep 1
printf "\nEditing ./scripts/client.mjs hostname...\n"
changeip
sleep 1
printf "Hostname was changed to: ${changedip}"
printf "\n...\n"
sleep 1

if [[ -z $ip && -z $changedip && $ip = $changedip ]]; then
    printf "Failed to retrieve hostnames\n"
elif [[ -n $ip && -z $changedip ]]; then
    printf "Failed to change hostname\n"
elif [[ -n $ip && -n $changedip && $ip = $changedip ]]; then
    printf "Successfully changed hostname. Enjoy the game!\n"
elif [[ -n $ip && -n $changedip && $ip != $changedip ]]; then
    printf "*Error*: The hostname in ./scripts/client.mjs was changed to $changedip instead of $ip\n" 
    printf "\nYou can restore the changes by typing 'restore' into the prompt below.\nIf you'd like to manually change the hostname then type the desired hostname into the input field.\nThe client.mjs file will be editted in place (or CTRL+C to exit w/ changes).\n"
    printf ">>Input manual hostname (ip-address) [accepts only numbers/periods or the word 'restore']: "; read input
    sleep 1 
    printf "...\n" 
    if [[ -n $input && $input = restore ]]; then
    git restore ./scripts/client.mjs
    printf "Successfully restored hostname back to: "; grep "var myHostname" ./scripts/client.mjs
    elif [[ -n $input && $input != restore ]]; then 
    sed -i "s,${changedip},${input}," ./scripts/client.mjs
    printf "Successfully changed hostname to: "; grep "var myHostname" ./scripts/client.mjs
    else printf "Failed user prompt, ./scripts/client.mjs file will be restored to original.\n "; git restore ./scripts/client.mjs; grep "var myHostname" ./scripts/client.mjs
    fi
    sleep 1
else printf "Failed to retrieve WSL hostname or other unknown error, email me at\nb r a d l e y h o w l e t t h @gmail.com\n(no spaces)\n"
fi
exit 0