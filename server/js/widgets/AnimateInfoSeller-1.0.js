var AnimateInfoSeller = function(){
    $('#user_information_slidedown').click(function (e) {
            e.preventDefault();
            var $this = $(this);
            $(this)
                    .closest('.slidedown')
                    .toggleClass('active')
                    .find('.slidedown__content[data-target="' + $this.data('target') + '"]')
                    .slideToggle(500);
        });
}


