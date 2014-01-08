from flask import Flask
from flask import request
import sys
import pyRserve

app = Flask(__name__)
app.debug = True
conn = None

def wrap_input(inp):
  return "capture.output(%s)" % inp

@app.route("/eval")
def root_entry():
  for key in request.args:
    print "%s: %s" % (key, request.args[key])

  result = conn.eval(request.args["request"])
  return "Result: %s" % str(result)


if __name__ == "__main__":
  rserve_port = 6311
  if len(sys.argv) > 1:
    rserve_port = sys.argv.get[1]
  conn = pyRserve.connect()
  app.run()
