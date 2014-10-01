var AnimateMessage = function () {
    $(":input:not(:checkbox):not(:button):not([type=hidden]):not([type=search]):not(.no-label)").floatlabel();
    $('.open-modal').click(function () {
        openModal($(this).data('target'));
    });

    $('.modal .close-modal').click(function () {
        var modal = $(this).closest('.modal');
        modal.removeClass('in');
        $('body').removeClass('modal-open');
    });

    $(document).click(function (event) {
        if ($(event.target).is('.modal')) {
            closeModal();
        }
    });

    function openModal(target) {
        $('#' + target).addClass('in');
        $('body').addClass('modal-open');
    }

    function closeModal(target) {
        var modal = (typeof (target) === 'undefined') ? $('.modal') : $('#' + target);

        $('body').removeClass('modal-open');
        modal.removeClass('in');
    }
    
    $('#submit_modal_message_form').click(function(){
        if($('#topic_user').val() && $('#topic_name').val() && $('#topic_text').val()){
            var modal =  $('.modal .close-modal').closest('.modal');
            modal.removeClass('in');
            $('body').removeClass('modal-open');
        }
    });
};


