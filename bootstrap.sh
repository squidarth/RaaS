sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update

sudo apt-get install mongodb-10gen -y

sudo apt-get install postgresql -y

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
