var AnimateContent = function () {
    /* «Выпадайка» */
    $('body').on("click", '#content_sort', function (e) {
        e.preventDefault();
        var $this = $(this);

        if ($this.is('.disabled')) {
            return false;
        }

        if (0 < $('#content_sort.active').length) {
            $('#content_sort.active')
                    .not(this)
                    .removeClass('active')
                    .closest('.dropdown')
                    .find('.dropdown__content')
                    .addClass('hidden');
        }

        $this.toggleClass('active')
                .closest('.dropdown')
                .find('.dropdown__content[data-target="' + $this.data('target') + '"]')
                .toggleClass('hidden');
    });

    /* Скрываем выпадайку по клику мимо неё */
    $(document).click(function (e) {
        var $this = $(e.target);

        if ($this.is('#content_sort')) {
            //
        } else {
            if (1 !== $this.parents().filter('.dropdown__content').length) {
                $('#content_sort.active')
                        .removeClass('active').
                        siblings('.dropdown__content')
                        .addClass('hidden');
            }
        }
    });

    /* По клику на внутреннюю ссылку «выпадайка» закрывается */
    $('body').on("click", '.dropdown__content a', function () {
        $(this).closest('.dropdown__content')
                .toggleClass('hidden').
                siblings('#content_sort')
                .toggleClass('active');
    });

    $('#js-nosidebar').on('click', function () {
        var li = $(this).closest('.menu__item');

        $('aside.b-sidebar')
                .find('a.btn')
                .toggleClass('dropdown__trigger')
                .siblings('.b-sidebar__dropdown')
                .toggleClass('dropdown__content hidden');

        if (li.is('.active')) {
            li.toggleClass('active');
        }


        $('section.store').toggleClass('nosidebar');
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
};


