$tenjoh.addWidget('LazyImage', function() {
    var self = this;
    var clear = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbW' +
                'FnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2' +
                'VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUC' +
                'BDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPS' +
                'JodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9Ii' +
                'IgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS' +
                '94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIH' +
                'htcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZD' +
                'pGREI5QzE2RjdENUYxMUUxQjg2NURGODZFMERFNjJFQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGREI5QzE3MDdENUYxMU' +
                'UxQjg2NURGODZFMERFNjJFQyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkZEQjlDMTZEN0' +
                'Q1RjExRTFCODY1REY4NkUwREU2MkVDIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkZEQjlDMTZFN0Q1RjExRTFCODY1REY4Nk' +
                'UwREU2MkVDIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+dW' +
                'GPQQAAAAZQTFRF////AAAAVcLTfgAAAAF0Uk5TAEDm2GYAAAAMSURBVHjaYmAACDAAAAIAAU9tWeEAAAAASUVORK5CYII=';
    self.load = function(element) {
        var imageURL, image, wrapper, circle,
            onPartialLoad, onImageLoad, isImageLoad = false,
            style, styleId = 'TenjohLazyImage',
            ringRadius = self.ringradius || 25,
            circleRadius = self.circleradius || 10,
            numCircles = self.numcircles || 8,
            circleColor = self.circlecolor || 'pink',
            centerX, centerY, pointX, pointY, deltaOfAngle = 360 / numCircles;
        if (element.nodeName != 'IMG') {
            return;
        } else {
            if (!element.hasAttribute('width')) {
                throw Error('width attribute is not defined');
            }
            if (!element.hasAttribute('height')) {
                throw Error('height attribute is not defined');
            }
        }

        if (!document.getElementById(styleId)) {
            style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = '@-webkit-keyframes ' + styleId + ' { 0%{-webkit-transform:scale(1);} 100%{-webkit-transform:scale(.3);} }';
            $root.rootElement.appendChild(style);
        }

        imageURL = element.getAttribute('data-src');
        if (!isEmpty($tenjoh.options.baseImageURL)) imageURL = $tenjoh.options.baseImageURL + imageURL;
        if ($tenjoh.Compiler.hasDoubleCurly(imageURL)) {
            return;
        }
        element.src = clear;
        wrapper = document.createElement('div');
        wrapper.style.width = element.getAttribute('width') + 'px';
        wrapper.style.height = element.getAttribute('height') + 'px';
        wrapper.style.position = 'relative';
        centerX = element.getAttribute('width') / 2 >> 0;
        centerY = element.getAttribute('height') / 2 >> 0;
        for (var i = 0; i < numCircles; i++) {
            pointX = ringRadius * Math.sin(deltaOfAngle * i * (Math.PI/180)) >> 0;
            pointY = ringRadius * Math.cos(deltaOfAngle * i * (Math.PI/180)) >> 0;
            circle = document.createElement('div');
            circle.style.width = circle.style.height = circleRadius + 'px';
            circle.style.position = 'absolute';
            circle.style.left = pointX + centerX + 'px';
            circle.style.top = pointY + centerY + 'px';
            circle.style.backgroundColor = circleColor;
            circle.style.webkitBorderRadius = circleRadius + 'px';
            circle.style.webkitAnimationName = styleId;
            circle.style.webkitAnimationDuration = '' + (numCircles - 1) / 10.0 + 's';
            circle.style.webkitAnimationIterationCount = 'infinite';
            circle.style.webkitAnimationDirection = 'linear';
            circle.style.webkitAnimationDelay = '' + (i + 1) / 10.0 + 's';
            wrapper.appendChild(circle);
        }
        image = new Image();
        image.src = imageURL;
        onImageLoad = image.addEventListener('load', function(event) {
            isImageLoad = true;
            image.removeEventListener('load', onImageLoad);
            var interval = setInterval(function() {
                if (wrapper.parentNode) {
                    wrapper.parentNode.replaceChild(element, wrapper);
                    element.src = imageURL;
                    clearInterval(interval);
                } else {
                    element.src = imageURL;
                    clearInterval(interval);
                }
            }, 100);
        });
        onPartialLoad = document.addEventListener('onPartialLoad', function(event) {
            document.removeEventListener('onPartialLoad', onPartialLoad);
            var interval = setInterval(function() {
                if (element.parentNode){
                    if (!isImageLoad) {
                        element.parentNode.replaceChild(wrapper, element);
                    }
                    clearInterval(interval);
                }
            }, 100);
        });
    };
});