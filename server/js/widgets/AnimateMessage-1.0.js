var AnimateMessage = function() {
    var self = this;
    self.Init = function(id) {
        $.colorbox({
            href: '#' + id,
            inline: true,
            width: "50%",
            className: "newMsgPopUp"
        });
    },
    self.Close = function() {
        $.colorbox.close();
    }
};


