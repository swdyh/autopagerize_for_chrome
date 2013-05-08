var SITEINFO_IMPORT_URLS = [
    'http://wedata.net/databases/AutoPagerize/items_all.json',
]
var CACHE_EXPIRE = 24 * 60 * 60 * 1000
var siteinfo = {}
window.onload = init

var excludes = [
    'https://mail.google.com/*',
    'http://b.hatena.ne.jp/*',
    'http://www.facebook.com/plugins/like.php*',
    'http://api.tweetmeme.com/button.js*'
]
function init() {
    if (!localStorage['settings']) {
        var defaultSettings = {
            extension_path: chrome.extension.getURL(''),
            display_message_bar: true,
            exclude_patterns: localStorage['exclude_patterns'] || ''
        }
        localStorage['settings'] = JSON.stringify(defaultSettings)
    }
    chrome.extension.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(message, con) {
            if (message.name == 'settings') {
                var res = JSON.parse(localStorage['settings'])
                res.exclude_patterns += ' ' + excludes.join(' ')
                con.postMessage({ name: message.name, data: res })
            }
            else if (message.name == 'siteinfo') {
                var res = SITEINFO_IMPORT_URLS.reduce(function(r, url) {
                    return r.concat(siteinfo[url].info)
                }, []).filter(function(s) {
                    try {
                        return message.data.url.match(s.url)
                    }
                    catch(e) {
                        // console.log(e);
                    }
                })
                con.postMessage({ name: message.name, data: res })
            }
            else if (message.name == 'launched') {
                port.onMessage.addListener(function(message, con) {
                    var tabid = con.sender.tab.id
                    var path = 'icons/icon16.png'
                    chrome.pageAction.show(tabid)
                    chrome.pageAction.setIcon({tabId:tabid, path: path})
                })
            }
            else if (message.name == 'siteinfo_meta') {
                var u = SITEINFO_IMPORT_URLS[0]
                var len = siteinfo[u].info.length
                var updated_at = siteinfo[u].expire - CACHE_EXPIRE
                con.postMessage({ name: message.name, len: len, updated_at: updated_at })
            }
            else if (message.name == 'update_siteinfo') {
                refreshSiteinfo({ force: true, callback: function() {
                    con.postMessage({ name: message.name, res: 'ok' })
                }})
            }
        })
    })
}

function loadLocalSiteinfoCallback(data) {
    var url = 'http://wedata.net/databases/AutoPagerize/items_all.json'
    var url_old = 'http://wedata.net/databases/AutoPagerize/items.json'
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

    // remove old url cache
    if (cache[url_old]) {
        delete cache[url_old]
        localStorage['cacheInfo'] = JSON.stringify(cache)
        console.log(Object.keys(cache))
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

function refreshSiteinfo(opt) {
    var opt = opt || {}
    var cache = JSON.parse(localStorage['cacheInfo'] || '{}')
    SITEINFO_IMPORT_URLS.forEach(function(url) {
        if (opt.force || !cache[url] || (cache[url].expire && new Date(cache[url].expire) < new Date())) {
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
                if (opt.callback) {
                    opt.callback()
                }
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



var checkReqs = {}
var isSameOrigin = function(urlA, urlB) {
    var aa = document.createElement('a')
    var ab = document.createElement('a')
    aa.href = urlA
    ab.href = urlB
    return aa.protocol === ab.protocol && aa.host === ab.host
}
var addHeader = function(headers, name, value) {
    var overwite = false
    for (var i = 0; i < headers.length; i++) {
        if (headers[i].name.toLowerCase() === name.toLowerCase()) {
            headers[i].value = value
            overwite = true
        }
    }
    return overwite ? headers : headers.concat({ name: name, value: value })
}
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        var xh = 'X-XMLHttpRequest-Block-CORS'
        var xblock = details.requestHeaders.filter(function(i) {
            return i.name.toLowerCase() === xh.toLowerCase()
        })[0]
        if (xblock) {
            checkReqs[details.requestId] = xblock.value
            var hs = details.requestHeaders.filter(function(i) {
                return !(i.name.toLowerCase() === xh.toLowerCase())
            })
            return { requestHeaders: hs }
        }
    },
    { urls: ["<all_urls>"], types: ["xmlhttprequest"] },
    ["blocking", "requestHeaders"]
)
chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        if (checkReqs[details.requestId]) {
            var isRedirect = details.responseHeaders.some(function(i) { return (/location/i).test(i.name) })
            if (!isRedirect) {
                var headers = addHeader(details.responseHeaders,
                                        'X-XMLHttpRequest-Final-URL',
                                        details.url)
                return {
                    cancel: !isSameOrigin(details.url,
                                          checkReqs[details.requestId]),
                    responseHeaders: headers
                }
            }
        }
    },
    { urls: ["<all_urls>"], types: ["xmlhttprequest"] },
    ["blocking", "responseHeaders"]
)
chrome.webRequest.onCompleted.addListener(
    function (details) {
        if (checkReqs[details.requestId]) {
            delete checkReqs[details.requestId]
        }
    },
    { urls: ["<all_urls>"], types: ["xmlhttprequest"] }
)
