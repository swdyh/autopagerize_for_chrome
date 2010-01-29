function setLocale(name) {
  var m = chrome.i18n.getMessage(name)
  if (m) {
    var es = document.querySelectorAll('.' + name)
    Array.prototype.slice.call(es).forEach(function(i) {
      if (i.nodeName == 'INPUT' && i.type == 'submit') {
        i.value = m
      }
      else {
        i.innerHTML = m
      }
    })
  }
}
