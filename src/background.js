var SITEINFO_IMPORT_URLS = [
    'http://wedata.net/databases/AutoPagerize/items.json',
]
var CACHE_EXPIRE = 24 * 60 * 60 * 1000
var siteinfo = {}
window.onload = init

function init() {
    chrome.extension.onConnect.addListener(function(port) {
        if (port.name == "siteinfoChannel") {
            port.onMessage.addListener(function(message, con) {
                var res = SITEINFO_IMPORT_URLS.reduce(function(r, url) {
                    return r.concat(siteinfo[url].info)
                }, []).filter(function(s) {
                    return message.url.match(s.url)
                })
                con.postMessage(res)
            })
        }
        else if (port.name == "settingsChannel") {
            port.onMessage.addListener(function(message, con) {
                var res = {}
                var keys = ['exclude_patterns']
                for (var i = 0; i < keys.length; i++) {
                    res[keys[i]] = localStorage[keys[i]]
                }
                res['extension_path'] = chrome.extension.getURL('')
                res['display_message_bar'] = false
                con.postMessage(res)
            })
        }
        else if (port.name == "pageActionChannel") {
            port.onMessage.addListener(function(message, con) {
                var tabid = con.tab.id
                var path = 'icons/' + message.replace('#', '') + '.png'
                chrome.pageAction.show(tabid)
                chrome.pageAction.setIcon({tabId:tabid, path: path})
            })
        }
    })
}

function loadLocalSiteinfoCallback(data) {
    var url = 'http://wedata.net/databases/AutoPagerize/items.json'
    var cache = JSON.parse(localStorage['cacheInfo'] || '{}')
    if (!cache[url]) {
        siteinfo[url] = {
            url: url,
            expire: new Date().getTime() - 1,
            info: reduceWedataJSON(data)
        }
        cache[url] = siteinfo[url]
        localStorage['cacheInfo'] = JSON.stringify(cache)
    }
    else {
        siteinfo[url] = cache[url]
    }
    refreshSiteinfo()
}

function reduceWedataJSON(data) {
    var r_keys = ['url', 'nextLink', 'insertBefore', 'pageElement']
    var info = data.map(function(i) {
        return i.data
    }).filter(function(i) {
        return ('url' in i)
    })
    if (info.length == 0) {
        return []
    }
    else {
        info.sort(function(a, b) {
            return (b.url.length - a.url.length)
        })
        return info.map(function(i) {
            var item = {}
            r_keys.forEach(function(key) {
                if (i[key]) {
                    item[key] = i[key]
                }
            })
            return item
        })
    }
}

function refreshSiteinfo() {
    var cache = JSON.parse(localStorage['cacheInfo'] || '{}')
    SITEINFO_IMPORT_URLS.forEach(function(url) {
        if (!cache[url] || (cache[url].expire && new Date(cache[url].expire) < new Date())) {
            var callback = function(res) {
                if (res.status != 200) {
                    return
                }
                var info = reduceWedataJSON(JSON.parse(res.responseText))
                if (info.length == 0) {
                    return
                }
                siteinfo[url] = {
                    url: url,
                    expire: new Date().getTime() + CACHE_EXPIRE,
                    info: info
                }
                cache[url] = siteinfo[url]
                localStorage['cacheInfo'] = JSON.stringify(cache)
            }
            try {
                get(url, callback)
            }
            catch(e) {
            }
        }
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

