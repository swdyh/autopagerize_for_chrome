function dispatchMessageAll(message, obj, urlpattern) {
    chrome.windows.getAll({ populate: true }, function(ws) {
        ws.forEach(function(w) {
            w.tabs.forEach(function(t) {
                if (!urlpattern || urlpattern.match(t.url)) {
                    chrome.tabs.sendMessage(t.id, { name: message, data: obj })
                }
            })
        })
    })
}
