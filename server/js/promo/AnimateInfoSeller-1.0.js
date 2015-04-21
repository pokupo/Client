var AnimateInfoSeller = function () {
    $('#user_information_slidedown').unbind('click');
    $('#user_information_slidedown').click(function (e) {
        e.preventDefault();
        var $this = $(this);
        $(this)
                .closest('.slidedown')
                .toggleClass('active')
                .find('.slidedown__content[data-target="' + $this.data('target') + '"]')
                .slideToggle(500, function(){
                    $(this).css('overflow', 'inherit');
                });
    });
    $('.info_seller_dropdown__trigger').unbind('click');
    $('.info_seller_dropdown__trigger').click(function (e) {
        e.preventDefault();
        var $this = $(this);

        if ($this.is('.disabled')) {
            return false;
        }

        if (0 < $('.info_seller_dropdown__trigger.active').length) {
            $('.info_seller_dropdown__trigger.active')
                    .not(this).removeClass('active')
                    .closest('.info_seller_dropdown')
                    .find('.info_seller_dropdown__content').addClass('hidden');
        }

        $this.toggleClass('active')
                .closest('.info_seller_dropdown')
                .find('.info_seller_dropdown__content[data-target="' + $this.data('target') + '"]')
                .toggleClass('hidden');
    })
    $('.info_seller_dropdown__content a').unbind('click');
    $('.info_seller_dropdown__content a').click(function () {
        $(this).closest('.info_seller_dropdown__content').toggleClass('hidden').
                siblings('.info_seller_dropdown__trigger').toggleClass('active');
    });
    
    $(document).click(function (e) {
        var $this = $(e.target);

        if ($this.is('.info_seller_dropdown__trigger')) {
            //
        } else {
            if (1 !== $this.parents().filter('.info_seller_dropdown__content').length) {
                $('.info_seller_dropdown__trigger.active').
                        removeClass('active').
                        siblings('.info_seller_dropdown__content').addClass('hidden');
            }
        }
    });
    $('[rel=tooltip]').tooltip();
}


