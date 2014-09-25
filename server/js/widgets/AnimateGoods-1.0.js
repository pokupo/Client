var AnimateGoods = function () {
    $('.b-catalog-item__photos').fotorama({
        width: 313,
        allowfullscreen: true,
        loop: true,
        autoplay: false,
        stopautoplayontouch: true,
        nav: 'thumbs',
        thumbwidth: 65,
        thumbheigth: 60,
        thumbmargin: 5,
        thumbborderwidth: 4,
        arrows: false,
        shadows: true,
        transition: 'slide',
    });

    $('#more_block .tab__trigger').click(function () {
        var $this = $(this);
        $this.siblings()
                .removeClass('selected');
        $this.addClass('selected')
                .next()
                .addClass('selected');
    });
}

