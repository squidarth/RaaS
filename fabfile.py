from fabric.api import *
from time import gmtime, strftime

env.hosts = ['ubuntu@ec2-184-72-141-86.compute-1.amazonaws.com']
env.key_filename = '~/.ssh/rsaas-main.pem'
git_clone = "git clone git@github.com:squidarth/RaaS.git"
active_dir_name = "~/source/current"

def run_ls():
  run("ls -alt")

def clone_git():
  timestamp = strftime("%Y%m%d%H%M%S", gmtime())
  new_release_dir = "~/source/releases/%s" % timestamp
  run("mkdir -p %s" % new_release_dir)
  run("%s %s" % (git_clone, new_release_dir))

  # Change the symlink
  run("ln -snf %s %s" % (new_release_dir, active_dir_name))
  print "Checked out git repo"

def restart_flask_app():
  print "restarting flask app"
