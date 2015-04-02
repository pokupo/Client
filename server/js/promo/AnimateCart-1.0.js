var AnimateCart = function () {
    $('#cart_dropdown__trigger').click( function (e) {
        var $this = $(this);

        if ($this.is('.disabled')) {
            return false;
        }

        if (0 < $('#cart_dropdown__trigger.active').length) {
            $('#cart_dropdown__trigger.active')
                    .not(this).removeClass('active')
                    .closest('.dropdown')
                    .find('#cart_dropdown__content').addClass('hidden');
        }

        $this.toggleClass('active')
                .closest('.dropdown')
                .find('#cart_dropdown__content')
                .toggleClass('hidden');
    });

    $('#cart_dropdown__content a').click(function () {
        $(this).closest('#cart_dropdown__content').toggleClass('hidden').
                siblings('#cart_dropdown__trigger').toggleClass('active');
    });
    
    $(document).click(function (e) {
        var $this = $(e.target);

        if ($this.is('#cart_dropdown__trigger, .btn-circle--drop')) {
            if($('.b-cart-menu__goods li').length == 0){
                $('#cart_dropdown__trigger').
                    removeClass('active').
                    siblings('#cart_dropdown__content').addClass('hidden');
            }
        } else {
            if (1 !== $this.parents().filter('#cart_dropdown__content').length) {
                $('#cart_dropdown__trigger').
                        removeClass('active').
                        siblings('#cart_dropdown__content').addClass('hidden');
            }
        }
    });
    
    $('[rel=tooltip]').tooltip();
};


