var AnimateRegistration = function () {
    if (Routing.route == 'registration') {
        $('#phone').mask("?9 999 999 99 99 99");
        $(":input:not(:checkbox):not(:button):not([type=hidden]):not([type=search]):not(.no-label)").floatlabel();
    
        var step = Routing.params.step;
        var progress = 0;
        var current = step / 4;

        var canvas = document.getElementById('progressCircle');
        var circle = new ProgressCircle({
            canvas: canvas,
        });

        circle.addEntry({
            fillColor: '#ffa800',
            progressListener: function () {
                return progress;
            }
        }).start(30);

        var intervalId;
        if (progress < current) {
            intervalId = setInterval(function () {
                if (progress < current) {
                    progress = progress + 0.015;
                } else {
                    clearInterval(intervalId);
                }
//                progress = (progress < current) ? progress + 0.015 : progress;
            }, 30);

        } else {
            intervalId = setInterval(function () {
                if (progress > current) {
                    progress = progress - 0.015;
                } else {
                    clearInterval(intervalId);
                }
            }, 30);
        }
    }
};

