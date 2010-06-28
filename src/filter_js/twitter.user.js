(function() {
console.log(1)
    var re = /^http:\/\/twitter\.com\//
    var re_ex = /^http:\/\/twitter\.com\/([^/]+\/)?(following|followers)/
    if (re.test(location.href) && !re_ex.test(location.href)) {
console.log(2)
        AutoPagerize.addRequestFilter(function(opt) {
            var a = document.getElementById('more')
            if (a) {
                var event = document.createEvent('MouseEvents')
                event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
                a.dispatchEvent(event)
            }
            opt.stop = true
            opt.url += '&foo=' + Math.random()
        })
    }
})()
