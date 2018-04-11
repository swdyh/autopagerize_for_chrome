function set(key, val) {
    localStorage[key] = val
    return val
}
function init() {
    setLocalesAll()

    var settings = JSON.parse(localStorage['settings'])
    var form = document.getElementById('settings_form')
    var form_ep = document.getElementById('form_ep')
    var form_dm = document.getElementById('form_dm')
    form_ep.value = settings['exclude_patterns'] || ''
    form_dm.checked = settings['display_message_bar'] === false ? false : 'checked'
    form.addEventListener('submit', function() {
        settings['exclude_patterns'] = form_ep.value
        settings['display_message_bar'] = !!form_dm.checked
        localStorage['settings'] = JSON.stringify(settings)
        dispatchMessageAll('updateSettings', settings)
    }, false)
    updateCacheInfoInfo()

    var us = document.getElementById('update_siteinfo')
    us.addEventListener('click', updateCacheInfo)
}

function updateCacheInfoInfo() {
    var port = chrome.runtime.connect( { name: 'siteinfo_meta' })
    port.onMessage.addListener(function(res) {
        if (res.len) {
            document.getElementById('siteinfo_size').innerHTML = res.len
        }
        if (res.updated_at) {
            var d = new Date(res.updated_at)
            document.getElementById('siteinfo_updated_at').innerHTML = d
        }
    })
    port.postMessage({ name: 'siteinfo_meta' })
}

function updateCacheInfo() {
    var port = chrome.runtime.connect( { name: 'update_siteinfo' })
    port.onMessage.addListener(function(res) {
        if (res.res == 'ok') {
            updateCacheInfoInfo()
            alert(chrome.i18n.getMessage('update_siteinfo_complete'))
        }
    })
    port.postMessage({ name: 'update_siteinfo' })
}

window.addEventListener('load', init, false)
