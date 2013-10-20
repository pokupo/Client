var AuthenticationWidget = function(){
    var self = this;
    self.widgetName = 'AuthenticationWidget';
    self.settings = {
        containerFormId : null,
        tmplPath : null,
        authFormTmplId : null,
        containerSidebarId : null,
        inputParameters : {},
        https : null,
        style : null
    };
    self.InitWidget = function(){
        self.settings.containerFormId = Config.Containers.authentication.widget; 
        self.settings.tmplPath = Config.Authentication.tmpl.path;
        self.settings.authFormTmplId = Config.Authentication.tmpl.authFormTmplId;
        self.settings.https = Config.Authentication.https;
        self.settings.style = Config.Authentication.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/AuthenticationWidget.js/);
            if(temp.authentication){
                input = temp.authentication;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.authentication){
            input = WParameters.authentication;
        }
        if(!$.isEmptyObject(input)){
            if(input.tmpl){
                self.settings.tmplPath = 'authentication/' + input.tmpl + '.html';
            }
            if(input.https){
                self.settings.https = input.https;
                Parameters.cache.https = input.https;
            }
            if(input.container && input.container.widget){
                self.settings.containerFormId = input.container.widget; 
            }
        }
        self.settings.inputParameters = input;
    };
    self.CheckAuthenticationRoute = function(){
        if(Routing.route == 'login'){
            self.SelectTypeContent();
        }
        else
            self.WidgetLoader(true);
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                 self.CheckAuthenticationRoute();
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                     self.CheckAuthenticationRoute();
                });
            });
        }
        
        EventDispatcher.AddEventListener('widget.change.route', function (){
            self.CheckAuthenticationRoute();
        });
        
        EventDispatcher.AddEventListener('AuthenticationWidget.authentication.submit', function (data){
           self.BaseLoad.Login(data.username, data.password, data.rememberMe, function(request){
               EventDispatcher.DispatchEvent('widget.authentication.test', {data:data, request:request});
           })
        });
        
        EventDispatcher.AddEventListener('widget.authentication.test', function(data){
            if(data.request.err){
                data.data.error = "Ошибка в логине или пароле";
                var sidebar = new AuthenticationSidebarViewModel();
                self.Render.Authentication(data.data, sidebar);
            }
            else{
                EventDispatcher.DispatchEvent('widget.authentication.ok', data);
            }
        });
        
        EventDispatcher.AddEventListener('widget.authentication.ok', function(){
            if(Routing.route != 'registration'){
                var last = Parameters.cache.lastPage;
                if(last.route == 'login' || !last.route)
                    Routing.SetHash('default', 'Домашняя', {});
                else
                    Routing.SetHash(last.route, last.title, last.data);
            }
        });
    };
    self.SelectTypeContent = function(){
        if(Routing.route == 'login'){
            self.InsertContainer.Authentication();
            self.Fill.Authentication();
        }
    };
    self.InsertContainer = {
        Authentication : function(){
            $("#" + self.settings.containerFormId).html($('script#' + self.settings.authFormTmplId).html());
        }
    };
    self.Fill = {
        Authentication : function(){
            var sidebar = new AuthenticationSidebarViewModel();
            var form = new AuthenticationFormViewModel();
            self.Render.Authentication(form, sidebar);
        }
    };
    self.Render = {
        Authentication : function(form, sidebar){
            if($("#" + self.settings.containerFormId).length > 0){
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            self.WidgetLoader(true, self.settings.containerFormId);
        }
    };
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                for(var i=0; i<=Config.Containers.authentication.length-1; i++){
                    $("#" + Config.Containers.authentication[i]).css(self.settings.style);
                }
            });
        }
    };
};

var AuthenticationSidebarViewModel = function(){
    var self = this;
    self.ClickRegistration = function(){
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
        Routing.SetHash('registration', 'Регистрация пользователя', {step: 1});
    };
};

var AuthenticationFormViewModel = function(){
    var self= this;
    self.username = null;
    self.password = null;
    self.rememberMe = null;
    self.error = null;
    
    self.Login = function(data){
        self.username = $(data.username).val();
        self.password = $(data.password).val();
        self.rememberMe = $(data.remember_me).is(':checked') ? 'on' : 'off';
        EventDispatcher.DispatchEvent('AuthenticationWidget.authentication.submit', self);
    };
    self.ClickRegistration = function(){
        Routing.SetHash('registration', 'Регистрация пользователя', {step:1});
    };
    self.ClickZPayment = function(){
        
    };
    self.ForgotPassword = function(){
        window.location.href = 'https://' + window.location.hostname + '/resetting/request'
    };
};

var TestAuthentication = {
    Init : function(){
        if(typeof Widget == 'function'){
            AuthenticationWidget.prototype = new Widget();
            var auth = new AuthenticationWidget();
            auth.Init(auth);
        }
        else{
            setTimeout(function(){TestAuthentication.Init()}, 100);
        }
    }
}

TestAuthentication.Init();

