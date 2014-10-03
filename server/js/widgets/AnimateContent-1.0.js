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

//    $('#js-nosidebar').on('click', function () {
//        var li = $(this).closest('.menu__item');
//
//        $('aside.b-sidebar')
//                .find('a.btn')
//                .toggleClass('dropdown__trigger')
//                .siblings('.b-sidebar__dropdown')
//                .toggleClass('content_filter_sort_dropdown__content hidden');
//
//        if (li.is('.active')) {
//            li.toggleClass('active');
//        }
//
//
//        $('section.store').toggleClass('nosidebar');
//    });

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
};


