ifconfig | grep inet | sed -e '2,4d' -e 's/  netmask/\n\t  netmask/' -e 's/broadcast/\n\tbroadcast/' | sed -e '2,3d' -e 's/        inet //' > ./tmp-ip.txt
ip=$(cat ./tmp-ip.txt)
echo -e "changing hostname to: ${ip}\n..."
sed -i "s,window.location.hostname,\"${ip}\"," ./game/scripts/libs/client.mjs
rm ./tmp-ip.txt
head ./game/scripts/libs/client.mjs | grep "var myHostname" 
