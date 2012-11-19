var Widget = function(){
    this.BaseSettings = {
        containerIdForTmpl : "container_tmpl",
        shopId : JSSettings.inputParameters['shopId']
    };
    this.CreateContainer = function(){
        if($('#' + Widget.Settings.containerIdForTmpl).length == 0)
            $('body').append("<div id='" + Widget.Settings.containerIdForTmpl + "'></div>");
    };
}