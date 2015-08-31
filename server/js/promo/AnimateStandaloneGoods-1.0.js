var AnimateStandaloneGoods = function () {
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
        transition: 'slide'
    });

    $('#more_block .tab__trigger').click(function () {
        var $this = $(this);
        $this.siblings()
            .removeClass('selected');
        $this.addClass('selected')
            .next()
            .addClass('selected');
    });

    $('#btn_to_cart').click(function () {
        var item = $('.b-catalog-item .fotorama__stage__shaft .fotorama__active');

        var x = item.offset().left,
            y = item.offset().top,
            tx = $('.menu-login').offset().left + 60;


        item.clone()
            .appendTo($('body'))
            .addClass('hallucination')
            .css({
                position: 'absolute',
                left: x,
                top: y,
                zIndex: 999
            })
            .animate({
                opacity: 0.5,
                left: tx,
                top: 0,
                width: 50,
                height: 100
            },
            600,
            function () {
                $(this).remove();
            }
        );
    });
    if(typeof (Ya) != 'undefined'){
        new Ya.share({
            element: 'ya_share'
        });
    }
    //$('[rel=tooltip]').tooltip();
}

