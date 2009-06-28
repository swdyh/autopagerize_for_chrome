import os
import time
from subprocess import Popen,PIPE

chrome = "C:\\Documents and Settings\\Administrator\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe"

def package_extension(src, key):
    opt1 ='--pack-extension=' + src
    opt2 ='--pack-extension-key=' + key
    proc = Popen([chrome, opt1, opt2], stdout=PIPE, stderr=PIPE)
    # print proc.communicate()[0]
    # stdout, stderr = proc.communicate()

def open_chrome():
    opts = ["--enable-user-scripts", "--enable-extensions"]
    os.spawnl(os.P_NOWAIT, chrome, opts[0], opts[1])

def rm(path):
    if os.path.isfile(path):
        os.remove(path)

crx = "autopagerize_for_chrome.crx"
src ='\\\\.host\\Shared Folders\\youhei_mac\\dev\\js\\chrome\\autopagerize_for_chrome\\src'
key ='\\\\.host\\Shared Folders\\youhei_mac\\dev\\js\\chrome\\autopagerize_for_chrome\\autopagerize_for_chrome.pem'
rm(crx)
package_extension(src, key)
time.sleep(2)
os.rename('src.crx', crx)
open_chrome()
time.sleep(2)
os.startfile(crx)
print 'ok'

