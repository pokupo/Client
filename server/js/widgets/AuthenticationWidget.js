var AuthenticationWidget = function(){
    var self = this;
    self.widgetName = 'AuthenticationWidget';
    self.settings = {
        containerFormId : null,
        containerSidebarId : null,
        tmplPath : null,
        authFormTmplId : null,
        authSidebarTmplId : null,
        inputParameters : {},
        https : null,
        style : null
    };
    self.InitWidget = function(){
        self.settings.containerFormId = Config.Containers.authentication[0]; 
        self.settings.containerSidebarId = Config.Containers.authentication[1]; 
        self.settings.tmplPath = Config.Authentication.tmpl.path;
        self.settings.authFormTmplId = Config.Authentication.tmpl.authFormTmplId;
        self.settings.authSidebarTmplId = Config.Authentication.tmpl.authSidebarTmplId;
        self.settings.https = Config.Authentication.https;
        self.settings.style = Config.Authentication.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settings.inputParameters = JSCore.ParserInputParameters(/AuthenticationWidget.js/);
        if(self.settings.inputParameters['params']){
            var input = JSON.parse(self.settings.inputParameters['params']);
            self.settings.inputParameters['params'] = input;
            
            if(input.tmpl){
                self.settings.tmplPath = 'authentication/' + input.tmpl + '.html';
            }
            if(input.https){
                self.settings.https = input.https;
                Parameters.cache.https = input.https;
            }
        }
    };
    self.CheckRoute = function(){
        if(Routing.route == 'login'){
            self.SelectTypeContent();
        }
        else{
            self.WidgetLoader(true);
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                 self.CheckRoute();
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                     self.CheckRoute();
                });
            });
        }
        
        EventDispatcher.AddEventListener('widget.change.route', function (){
            self.CheckRoute();
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
                    Routing.SetHash('catalog', 'Домашняя', {});
                else
                    Routing.SetHash(last.route, last.title, last.data);
            }
        });
    };
    self.SelectTypeContent = function(){
        $("#wrapper").removeClass("with_top_border").addClass("with_sidebar");
        if(Routing.route == 'login'){
            self.InsertContainer.Authentication();
            self.Fill.Authentication();
        }
    };
    self.InsertContainer = {
        Authentication : function(){
            if(Config.Containers.catalog)
                 $("#" + Config.Containers.catalog).show();
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.authFormTmplId).html());
            $("#" + self.settings.containerSidebarId).empty().append($('script#' + self.settings.authSidebarTmplId).html());
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
            if($("#" + self.settings.containerSidebarId).length > 0){
                ko.applyBindings(sidebar, $("#" + self.settings.containerSidebarId)[0]);
            }
            self.WidgetLoader(true);
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
        Routing.SetHash('registration', 'Регистрация пользователя', {});
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
        Loader.Indicator('AuthenticationWidget', false);
        EventDispatcher.DispatchEvent('AuthenticationWidget.authentication.submit', self);
    };
    self.ClickZPayment = function(){
        
    };
    self.ForgotPassword = function(){
        
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

