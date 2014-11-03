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
}
