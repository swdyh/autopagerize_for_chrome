function toggle() {
    var settings = JSON.parse(localStorage['settings'])
    dispatchMessageAll(settings.disable ? 'enableRequest' : 'disableRequest')
    settings.disable = !settings.disable
    localStorage['settings'] = JSON.stringify(settings)
    window.close()
}
function openOptionsPage() {
    window.close()
    window.open('options.html')
}
function init() {
    var settings = JSON.parse(localStorage['settings'])
    var t = document.getElementById('toggle')
    t.innerText = settings.disable ? 'on' : 'off'
    t.addEventListener('click', toggle, false)
    var o = document.getElementById('open_options_page')
    o.addEventListener('click', openOptionsPage, false)
    setLocalesAll()
}
window.addEventListener('load', init, false)
