var AnimateSearch = function(){
    $('.extendedSearchLink').unbind('click');
    $('.extendedSearchLink').click(function(e){
        e.preventDefault();
        $('#advancedSearch').slideToggle(500);
    })
}

