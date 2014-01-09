from flask import *
from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

import sys
import pyRserve

app = Flask(__name__)
app.debug = True
conn = None

def wrap_input(inp):
  return "capture.output(%s)" % inp

@app.route("/eval", methods=["POST"])
def root_entry():
  print "Request:"
  for key in request.form:
    print "%s: %s" % (key, request.form[key])
  print ""
  result = conn.eval(wrap_input(request.form["request"]))
  return jsonify(result=str(result))


if __name__ == "__main__":
  rserve_port = 6311
  if len(sys.argv) > 1:
    rserve_port = sys.argv.get[1]
  conn = pyRserve.connect()
  http_server = HTTPServer(WSGIContainer(app))
  http_server.listen(5000)
  IOLoop.instance().start()
