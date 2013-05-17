$tenjoh.UI.Fillter.addFilter('$date', function(value, controller, options) {
    var date = new Date(value);
    if (isEmpty(options) || isEmpty(options.format)) {
        return sprintf('%s/%s/%s %s:%s:%s',
            zeroPadding('' + date.getFullYear(), 4),
            zeroPadding('' + (date.getMonth() + 1), 2),
            zeroPadding('' + date.getDate(), 2),
            zeroPadding('' + date.getHours(), 2),
            zeroPadding('' + date.getMinutes(), 2),
            zeroPadding('' + date.getSeconds(), 2)
        );
    } else {
        if (options.format == 'mm/dd') {
            return sprintf('%s/%s',
                zeroPadding('' + (date.getMonth() + 1), 2),
                zeroPadding('' + date.getDate(), 2)
            );
        } else if (options.format == 'yyyy/mm/dd') {
            return sprintf('%s/%s/%s',
                zeroPadding('' + date.getFullYear(), 4),
                zeroPadding('' + (date.getMonth() + 1), 2),
                zeroPadding('' + date.getDate(), 2)
            );
        } else if (options.format == 'mm/dd hh:mm') {
            return sprintf('%s/%s %s:%s',
                zeroPadding('' + (date.getMonth() + 1), 2),
                zeroPadding('' + date.getDate(), 2),
                zeroPadding('' + date.getHours(), 2),
                zeroPadding('' + date.getMinutes(), 2)
            );
        }
    }
});