from socket import *
import json
s = socket()
s.bind(('', 80))
s.listen(4)
ns, na = s.accept()

while 1:
    try:
        data = ns.recv(8192)
    except:
        ns.close()
        s.close()
        break

    data = json.loads(data)
    print data