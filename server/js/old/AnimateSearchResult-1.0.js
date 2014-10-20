var AnimateSearchResult = function () {
    $('#sort_search_result_list ul').each(function() {
        var w = $(this).width();
        $(this).parent().css({'width': w + 'px'});
        $(this).parent().removeClass('active');
    });
    $('#sort_search_result_list').toggle(function() {
        $(this).addClass('active');
        return false;
    }, function() {
        $(this).removeClass('active');
    });
}

