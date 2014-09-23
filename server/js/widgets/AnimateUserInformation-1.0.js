var AnimateUserInformation = function(){
    $('.user_information_dropdown__trigger').click(function (e) {
        e.preventDefault();
        var $this = $(this);

        if ($this.is('.disabled')) {
            return false;
        }

        if (0 < $('.user_information_dropdown__trigger.active').length) {
            $('.user_information_dropdown__trigger.active')
                    .not(this).removeClass('active')
                    .closest('.dropdown')
                    .find('.user_information_dropdown__content').addClass('hidden');
        }

        $this.toggleClass('active')
                .closest('.dropdown')
                .find('.user_information_dropdown__content')
                .toggleClass('hidden');
    });

    $('.user_information_dropdown__content a').click(function () {
        $(this).closest('.user_information_dropdown__content').toggleClass('hidden').
                siblings('.user_information_dropdown__trigger').toggleClass('active');
    });
    
    $(document).click(function (e) {
        var $this = $(e.target);

        if ($this.is('.user_information_dropdown__trigger')) {
            //
        } else {
            if (1 !== $this.parents().filter('.user_information_dropdown__content').length) {
                $('.user_information_dropdown__trigger.active').
                        removeClass('active').
                        siblings('.user_information_dropdown__content').addClass('hidden');
            }
        }
    });
}


