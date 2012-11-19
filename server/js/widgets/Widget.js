var Widget = {
    Settings : {
        containerIdForTmpl : "container_tmpl",
        shopId : JSSettings.inputParameters['shopId']
    },
    Init : function(){
        Widget.SetContainerTmpl();
    },
    CreateContainer : function(){
        if($('#' + Widget.Settings.containerIdForTmpl).length == 0)
            $('body').append("<div id='" + Widget.Settings.containerIdForTmpl + "'></div>");
    }
}