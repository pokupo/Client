var AnimateSearch = function () {
    $('.search_dropdown__trigger').click( function (e) {
        e.preventDefault();
        var $this = $(this);

        if ($this.is('.disabled')) {
            return false;
        }

        if (0 < $('.search_dropdown__trigger.active').length) {
            $('.search_dropdown__trigger.active')
                    .not(this).removeClass('active')
                    .closest('.dropdown')
                    .find('.dropdown__content').addClass('hidden');
        }

        $this.toggleClass('active')
                .closest('.dropdown')
                .find('.dropdown__content[data-target="' + $this.data('target') + '"]')
                .toggleClass('hidden');
    });

    $('.dropdown__content a').click( function () {
        $(this).closest('.dropdown__content').toggleClass('hidden').
                siblings('.search_dropdown__trigger').toggleClass('active');
    });
    $(document).click(function (e) {
        var $this = $(e.target);

        if ($this.is('.search_dropdown__trigger')) {
            //
        } else {
            if (1 !== $this.parents().filter('.dropdown__content').length) {
                $('.search_dropdown__trigger.active').
                        removeClass('active').
                        siblings('.dropdown__content').addClass('hidden');
            }
        }
    });
}
