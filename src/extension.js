// Extension.js
// Browser Extension API Abstraction
// The MIT License
// Copyright (c) 2010 swdyh
function Extension() {
    this.listeners = {}
    var that = this
    var callback = function(message)  {
        if (message && message.name && that.listeners[message.name]) {
            that.listeners[message.name](message.data)
        }
    }
    if (Extension.isSafari()) {
        safari.self.addEventListener('message', function(event) {
            callback({ name: event.name, data: event.message })
        })
    }
    else if (Extension.isChrome()) {
        this.port = chrome.extension.connect({ name: 'message' })
        this.port.onMessage.addListener(callback)
        chrome.extension.onConnect.addListener(function(port) {
            if (port.name == 'message') {
                port.onMessage.addListener(callback)
            }
        })
        chrome.extension.onRequest.addListener(callback)
    }
    else if (Extension.isFirefox()) {
        self.on('message', function(res) {
            callback({ name: res.name, data: res.data })
        })
    }
}
Extension.prototype.postMessage = function(name, data, callback) {
    this.listeners[name] = callback || function() {}
    if (Extension.isSafari()) {
        safari.self.tab.dispatchMessage(name, data)
    }
    else if (Extension.isChrome()) {
        this.port.postMessage({ name: name, data: data })
    }
    else if (Extension.isFirefox()) {
        self.postMessage({ name: name, data: data })
    }
}
Extension.prototype.addListener = function(name, callback) {
    this.listeners[name] = callback
}
Extension.isSafari = function() {
    return (typeof safari == 'object') &&
        (typeof safari.extension == 'object')
}
Extension.isChrome = function() {
    return (typeof chrome == 'object') &&
        (typeof chrome.extension == 'object')
}
Extension.isGreasemonkey = function() {
    return (typeof GM_log == 'function')
}
Extension.isFirefox = function() {
    // FIXME
    return (!Extension.isGreasemonkey() && !Extension.isSafari() && !Extension.isChrome())
}
