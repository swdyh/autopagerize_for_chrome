import os
import time
import shutil
import chromium_extension

def remove_extension(id):
    path = "C:\Documents and Settings\Administrator\Local Settings\Application Data\Google\Chrome\User Data\Default\Extensions\\" + id
    if os.access(path, os.F_OK):
        shutil.rmtree(path)

def package_extension(indir, outfile):
    ext = chromium_extension.ExtensionDir(indir)
    ext.writeToPackage(outfile)
    pkg = chromium_extension.ExtensionPackage(outfile)

def open_chrome():
    path = "C:\Documents and Settings\Administrator\Local Settings\Application Data\Google\Chrome\Application\chrome.exe"
    opts = ["--enable-user-scripts", "--enable-extensions"]
    os.spawnl(os.P_NOWAIT, path, opts[0], opts[1])


crx = "autopagerize_for_chrome.crx"
id = "38c37d51986565d5334e62eb0d056c10a68d69c7"
package_extension("src", crx)
remove_extension(id)
open_chrome()
time.sleep(2)
os.startfile(crx)
print "ok"

