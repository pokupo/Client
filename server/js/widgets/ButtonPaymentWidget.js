var ButtonPaymentWidget = function(){
    var self = this;
    self.widgetName = 'ButtonPaymentWidget';
    self.settings = {
        tmplPath : null,
        contentTmpl : null,
        inputParameters : {},
        containerId : null,
        title : null,
        skin : null,
        skinFromMemory: false,
        uniq : null
    };
    self.InitWidget = function(){
        self.RegisterEvents();
        self.Loader();
    };
    self.Loader = function(){
        Loader.InsertContainer(self.settings.containerId);
    };
    self.SetParameters = function(data){
        self.settings.tmplPath = Config.ButtonPayment.tmpl.path;
        self.settings.contentTmpl = Config.ButtonPayment.tmpl.contentTmpl;
        self.settings.title = Config.ButtonPayment.title;
        self.settings.skin = Config.ButtonPayment.tmpl.skin;
        
        self.settings.containerId = data.element;
        
        var input = {};
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.buttonPayment){
            input = WParameters.buttonPayment;
        }
        if(!$.isEmptyObject(input)){
            if(input.tmpl)
                self.settings.tmplPath = 'buttonPayment/' + input.tmpl + '.html';
            if(input.skin){
                self.settings.skin = input.skin;
                self.settings.skinFromMemory = true;
            }
            if(input.title)
                self.settings.title = input.title;
        }
        self.settings.inputParameters = input; 
        for(var key in data.options.params){
            if(key == 'tmpl' && data.options.params['tmpl'])
                self.settings.tmplPath = 'buttonPayment/' + data.options.params['tmpl'] + '.html';
            else if(key == 'title' && data.options.params['title'])
                self.settings.title = data.options.params['title'];
            else if(key == 'skin' && data.options.params['skin']){
                self.settings.skin = data.options.params['skin'];
                self.settings.skinFromMemory = true;
            }
            else if (key = 'uniq' && data.options.params['uniq'])
                self.settings.uniq = data.options.params['uniq'];
            else
                self.settings.inputParameters[key] = data.options.params[key];
        }
    };
    self.CheckRouteButtonPayment = function(){
        if(Routing.route == 'payment'){
            
        }
        else{
            self.InsertContainer.Button();
            self.Fill.Button();
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                EventDispatcher.DispatchEvent('ButtonPayment.onload.tmpl_' + self.settings.uniq)
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                    EventDispatcher.DispatchEvent('ButtonPayment.onload.tmpl_' + self.settings.uniq)
                });
            });
        }
        
        EventDispatcher.AddEventListener('ButtonPayment.onload.tmpl_' + self.settings.uniq, function (data){
            self.CheckRouteButtonPayment();
        });
    };
    self.InsertContainer = {
        Button : function(){
            $(self.settings.containerId).empty().append($('script#' + self.settings.skin).html());
        }
    };
    self.Fill = {
        Button : function(){
            var button = new ButtonPaymentViewModel(self.settings);
            console.log(button);
            self.Render.Button(button);
        }
    };
    self.Render = {
        Button : function(data){
            ko.applyBindings(data, $(self.settings.containerId).children()[0]);
        }
    };
};

var ButtonPaymentViewModel = function(opt){
    var self = this;
    self.title = opt.title;
    
    self.ClickPay = function(){
        
    };
};
