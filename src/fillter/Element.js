(function() {
    var createElement = function(type, value, options, isInitial) {
        if (isInitial) return $tenjoh.DOM.createElement(type, value, options);
        else return value;
    };
    $tenjoh.UI.Fillter.addFilter('$div', function(value, controller, options, isInitial) { return createElement('div', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$span', function(value, controller, options, isInitial) { return createElement('span', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$img', function(value, controller, options, isInitial) { return createElement('img', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$p', function(value, controller, options, isInitial) { return createElement('p', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$em', function(value, controller, options, isInitial) { return createElement('em', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$text', function(value, controller, options, isInitial) { return createElement('text', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$password', function(value, controller, options, isInitial) { return createElement('password', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$submit', function(value, controller, options, isInitial) { return createElement('submit', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$reset', function(value, controller, options, isInitial) { return createElement('reset', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$hidden', function(value, controller, options, isInitial) { return createElement('hidden', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$checkbox', function(value, controller, options, isInitial) { return createElement('checkbox', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$radio', function(value, controller, options, isInitial) { return createElement('radio', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$textarea', function(value, controller, options, isInitial) { return createElement('textarea', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$button', function(value, controller, options, isInitial) { return createElement('button', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$a', function(value, controller, options, isInitial) { return createElement('a', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h1', function(value, controller, options, isInitial) { return createElement('h1', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h2', function(value, controller, options, isInitial) { return createElement('h2', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h3', function(value, controller, options, isInitial) { return createElement('h3', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h4', function(value, controller, options, isInitial) { return createElement('h4', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h5', function(value, controller, options, isInitial) { return createElement('h5', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h6', function(value, controller, options, isInitial) { return createElement('h6', value, options, isInitial); });
})();

