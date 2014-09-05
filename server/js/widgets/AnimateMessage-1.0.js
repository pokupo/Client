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
    };
    self.ListMessage = function() {
        jQuery('.activeHoverElement .actAreaShow').click(function() {
            $(this).closest(".horizontalSection").next().show();
            $(this).closest(".horizontalSection").hide();
            return false;
        });
        jQuery('.floatFieldsFormSetion .actAreaHide').click(function() {
            $(this).closest(".floatFieldsFormSetion").prev().show();
            $(this).closest(".floatFieldsFormSetion").hide();
            return false;
        });
        jQuery('.expandCollapse.expand').click(function() {
            $(this).closest(".htabsContent").find(".activeHoverElement").next().show();
            $(this).closest(".htabsContent").find(".activeHoverElement").hide();
            $(this).hide();
            $(".expandCollapse.collapse").show();
            return false;
        });
        jQuery('.expandCollapse.collapse').click(function() {
            $(this).closest(".htabsContent").find(".activeHoverElement").next().hide();
            $(this).closest(".htabsContent").find(".activeHoverElement").show();
            $(this).hide();
            $(".expandCollapse.expand").show();
            return false;
        });
    };
};


