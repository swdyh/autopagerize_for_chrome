(function() {
    var re = /^http:\/\/www\.google\.[^/]*\/images\?/
    if (re.test(location.href)) {
        var reqfl = function(opt) {
            if (opt.url.indexOf('gbv=2') == -1) {
                opt.url += '&gbv=1'
            }
            else {
                opt.url = opt.url.replace('gbv=2', 'gbv=1')
            }
        }
        window.AutoPagerize.addRequestFilter(reqfl)
        var si = [{
            url:          '^http://www\\.google\\.(\\w|\\.)+/images\\?',
            nextLink:     '//a[@class="pn" and @style]',
            pageElement:  'id("ires")'
        }]
        window.AutoPagerize.launchAutoPager(si)
    }
})()
