import sys
import os
import time
import logging
import boto
import shutil

from time import gmtime, strftime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from boto.s3.connection import S3Connection
from boto.s3.key import Key

AWS_ACCESS_KEY = os.environ["AWS_ACCESS_KEY"]
AWS_SECRET_KEY = os.environ["AWS_SECRET_KEY"]

def execute_upload(filepath):
  conn = S3Connection(AWS_ACCESS_KEY, AWS_SECRET_KEY)

  bucket = conn.get_bucket('raas_files')
  k = Key(bucket)
  k.key = filepath
  k.set_contents_from_filename(filepath)


def upload_to_s3(file_path):
  if int(os.stat(file_path).st_size) == 0:
    return

  timestamp = strftime("%Y%m%d%H%M%S", gmtime())
  basename = os.path.basename(file_path)
  extension = basename.split(".")[-1]

  new_filepath = "/tmp/%s" % (timestamp) if basename == extension else "/tmp/%s.%s" % (timestamp, extension)

  shutil.copy(file_path, new_filepath)

  print new_filepath

  execute_upload(new_filepath)


class FileWatcherHandler(FileSystemEventHandler):
  def on_created(self, event):
    upload_to_s3(event.src_path)
  def on_modified(self, event):
    upload_to_s3(event.src_path)

if __name__ == "__main__":
  # Watch the command line arguments carefully.
  #path = "/tmp/Rserv"
  path = "/tmp/Rserv"

  event_handler = FileWatcherHandler()
  observer = Observer()
  observer.schedule(event_handler, path, recursive=True)
  observer.start()

  while True:
    time.sleep(1)

  observer.join()



