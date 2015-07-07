var AnimateCatalog = function () {
    /* Баян-меню */
    $('.with-submenu').click(function (e) {
        var $this = $(e.target);
        if (1 !== $this.parents().filter('.submenu').length) {
            $(this)
                    .toggleClass('active')
                    .children('.submenu').toggleClass('active');
        }
    });
    $('[rel=tooltip]').tooltip();

    if(Routing.IsCategory()) {
        $('section.store').addClass('nosidebar');
        $('#catalogBtn').click(function () {
            $('aside.b-sidebar')
                .find('a.btn')
                .siblings('.b-sidebar__dropdown')
                .toggleClass('hidden');
            $('section.store').toggleClass('nosidebar');
        })
    }
    else if(Routing.IsGoods()){
        $('section.store').addClass('nosidebar');

        $('#catalogBtn').click(function () {
            $('aside.b-sidebar')
                .find('a.btn')
                .siblings('.b-sidebar__dropdown')
                .toggleClass('hidden');
        })
        $('#catalogBtn').siblings('.b-sidebar__dropdown').addClass('dropdown__content');
    }
    else{
        $('#catalogBtn').hide()
            .siblings('.b-sidebar__dropdown')
            .toggleClass('hidden');
        $('section.store').removeClass('nosidebar');
    }
}
