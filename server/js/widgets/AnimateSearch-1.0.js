var AnimateSearch = function () {
    $('body').on("click", '.dropdown__trigger', function (e) {
        e.preventDefault();
        var $this = $(this);

        if ($this.is('.disabled')) {
            return false;
        }

        if (0 < $('.dropdown__trigger.active').length) {
            $('.dropdown__trigger.active')
                    .not(this).removeClass('active')
                    .closest('.dropdown')
                    .find('.dropdown__content').addClass('hidden');
        }

        $this.toggleClass('active')
                .closest('.dropdown')
                .find('.dropdown__content[data-target="' + $this.data('target') + '"]')
                .toggleClass('hidden');
    });

    $('body').on("click", '.dropdown__content a', function () {
        $(this).closest('.dropdown__content').toggleClass('hidden').
                siblings('.dropdown__trigger').toggleClass('active');
    });
    $(document).click(function (e) {
        var $this = $(e.target);

        if ($this.is('.dropdown__trigger')) {
            //
        } else {
            if (1 !== $this.parents().filter('.dropdown__content').length) {
                $('.dropdown__trigger.active').
                        removeClass('active').
                        siblings('.dropdown__content').addClass('hidden');
            }
        }
    });
}
