sudo apt-get install redis-server -y

sudo apt-get install libssl-dev -y
sudo apt-get install curl -y
type node >/dev/null 2>&1 || bash < <(curl http://h3manth.com/njs)

sudo apt-get update -y
sudo apt-get install git -y
sudo apt-get install vim -y
sudo apt-get install r-base -y
sudo apt-get install python-pip -y
sudo apt-get install python-dev -y
sudo pip install pyRserve
sudo pip install flask
sudo pip install fabric
sudo pip install supervisor
sudo pip install pyinotify
sudo pip install watchdog
sudo pip install boto
sudo pip install tornado

echo "Remember to add Rserve to R library list"
