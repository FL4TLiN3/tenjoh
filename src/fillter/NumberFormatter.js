$tenjoh.UI.Fillter.addFilter('$figure', function(value, partial, options) {
    return String(value).replace(/([0-9]+?)(?=(?:[0-9]{3})+$)/g, '$1,');
});