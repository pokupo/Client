var AnimateSelectList = function(id) {
    $('#' + id + ' ul').each(function() {
        var w = $(this).width();
        $(this).parent().css({'width': w + 'px'});
        $(this).parent().removeClass('active');
    });
    $('#' + id).toggle(function() {
        $(this).addClass('active');
        return false;
    }, function() {
        $(this).removeClass('active');
    });
}


