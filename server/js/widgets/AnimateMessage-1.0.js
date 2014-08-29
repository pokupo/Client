var AnimateMessage = function(){
    $(".goButton").colorbox({
        inline: true,
        width: "50%",
        className: "newMsgPopUp"
    });
    $("#newMessage .cancel").click(function() {
        $.colorbox.close();
    })
};


