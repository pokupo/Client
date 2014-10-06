var AnimateOrderList = function(id) {
    var	yoffset = 25;
    $('.floatPopup').parent().hoverIntent({
        over: function() {
            $(this).find(".floatPopup").show();
        },
        out: function() {
            $(this).find(".floatPopup").hide();
        },
        interval: 400
    }).mousemove(function(e) {
        var w = $(this).find(".floatPopup").width();
        $(this).find(".floatPopup").css({
            top: e.pageY + yoffset,
            left: e.pageX - w / 2
        });
    });
};


