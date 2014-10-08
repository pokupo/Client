var AnimateMessage = function () {
    
    $('.newMessage a').click(function(){
        $.colorbox({
            href: '#message_modal_form',
            inline: true,
            width: "50%",
            className: "newMsgPopUp"
        });
    });
    $('#message_modal_form_cancel').click(function(){
        $.colorbox.close();
    })
};


