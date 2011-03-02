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
    }, false)
}
window.addEventListener('load', init, false)
