$tenjoh.UI.Fillter.addFilter('$before', function(value, partial, options) {
	if (isUndefined(options.param)) return value;
	return options.param + value;
});
$tenjoh.UI.Fillter.addFilter('$after', function(value, partial, options) {
	if (isUndefined(options.param)) return value;
	return value + options.param;
});