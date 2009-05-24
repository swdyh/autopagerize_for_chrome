var siteinfo = []
var urls = ['http://wedata.net/databases/AutoPagerize/items.json']
var fs = {
    get_siteinfo: function(message) {
        var u = message[1].url
        return siteinfo.filter(function(s) {
            return u.match(s.url)
        })
    },
    echo: function(message) {
        return message
    }
}
window.onload = init

function init() {
    chrome.self.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(message, con){
            var f = fs[message[0]]
            if (f) {
                con.postMessage([message[0], f(message)])
            }
        })
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
