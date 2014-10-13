var AnimateContent = function () {
    /* «Выпадайка» */
    $('.content_filter_sort_dropdown__trigger').click(function (e) {
        e.preventDefault();
        var $this = $(this);

        if ($this.is('.disabled')) {
            return false;
        }

        if (0 < $('.content_filter_sort_dropdown__trigger.active').length) {
            $('.content_filter_sort_dropdown__trigger.active')
                    .not(this)
                    .removeClass('active')
                    .closest('.dropdown')
                    .find('.content_filter_sort_dropdown__content')
                    .addClass('hidden');
        }

        $this.toggleClass('active')
                .closest('.dropdown')
                .find('.content_filter_sort_dropdown__content[data-target="' + $this.data('target') + '"]')
                .toggleClass('hidden');
    });

    /* Скрываем выпадайку по клику мимо неё */
    $(document).click(function (e) {
        var $this = $(e.target);

        if ($this.is('.content_filter_sort_dropdown__trigger')) {
            //
        } else {
            if (1 !== $this.parents().filter('.content_filter_sort_dropdown__content').length) {
                $('.content_filter_sort_dropdown__trigger.active')
                        .removeClass('active').
                        siblings('.content_filter_sort_dropdown__content')
                        .addClass('hidden');
            }
        }
    });

    /* По клику на внутреннюю ссылку «выпадайка» закрывается */
    $('.content_filter_sort_dropdown__content a').click(function () {
        $(this).closest('.content_filter_sort_dropdown__content')
                .toggleClass('hidden').
                siblings('.content_filter_sort_dropdown__trigger')
                .toggleClass('active');
    });

    $('.chain-slider').owlCarousel({
        items: 3,
        slideSpeed: 700,
        rewindSpeed: 700,
        navigation: true,
        navigationText: ['', ''],
        scrollPerPage: true,
        pagination: false,
        responsive: false,
        theme: '',
    });
    
    $('.b-catalog-banner').fotorama({
        width: '100%',
        height: 330,
        allowfullscreen: false,
        loop: true,
        autoplay: 3500,
        transitionduration: 500,
        stopautoplayontouch: true,
        nav: 'dots',
        arrows: false,
        shadows: false,
        transition: 'crossfade',
        fit: 'cover'
    });
    
    $('.b-item__order-button .btn').click(function () {
        var $this = $(this);
        var item = $this.closest('.b-item__popover');

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
};


