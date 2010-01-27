var siteinfo = []
var urls = ['http://wedata.net/databases/AutoPagerize/items.json']
window.onload = init

function init() {
    chrome.extension.onConnect.addListener(function(port) {
        if (port.name == "siteinfoChannel") {
            port.onMessage.addListener(function(message, con) {
                var res = siteinfo.filter(function(s) {
                    return message.url.match(s.url)
                })
                con.postMessage(res)
            })
        }
        if (port.name == "settingsChannel") {
console.log('receive settingChannel')
            port.onMessage.addListener(function(message, con) {
                var res = {}
                var keys = ['exclude_patterns']
                for (var i = 0; i < keys.length; i++) {
                    res[keys[i]] = localStorage[keys[i]]
                }
                con.postMessage(res)
            })
        }
    })

    urls.forEach(function(url) {
        get(url, function(res) {
            var s = JSON.parse(res.responseText)
            var d = s.map(function(i) { return i.data })
            Array.prototype.push.apply(siteinfo, d)
        })
    })
}

function get(url, callback, opt) {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            callback(xhr)
        }
    }
    xhr.open('GET', url, true)
    xhr.send(null)
    return xhr
}
