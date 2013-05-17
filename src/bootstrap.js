(function () {
    $tenjoh.options = {
        xhrDebug: true,
        partialCache: false,
        debugAnimation: true,
        XHR: {
            status401: function(body) {
                console.log(body);
            }
        }
    };
    window.addEventListener('load', function() {
        $root = new $tenjoh.RootController();
        $root.init();
    }, false);
})();


