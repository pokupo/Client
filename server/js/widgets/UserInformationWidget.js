var UserInformationWidget = function(){
    var self = this;
    self.widgetName = 'UserInformationWidget';
    self.settings = {
        containerId : null, 
        tmplPath : null,
        infoTmplId : null,
        authTmplId : null,
        inputParameters : {},
        showBlocks : null,
        style : null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.userInformation; 
        self.settings.tmplPath = Config.UserInformation.tmpl.path;
        self.settings.infoTmplId = Config.UserInformation.tmpl.infoTmplId;
        self.settings.authTmplId = Config.UserInformation.tmpl.authTmplId;
        self.settings.showBlocks = Config.UserInformation.showBlocks;
        self.settings.style = Config.UserInformation.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settings.inputParameters = JSCore.ParserInputParameters(/UserInformationWidget.js/);
        if(self.settings.inputParameters['params']){
            var input = JSON.parse(self.settings.inputParameters['params']);
            self.settings.inputParameters['params'] = input;
            if(input.show){
                for(var i = 0; i <= input.show.length-1; i++){
                    if($.inArray(input.show[i], self.settings.showBlocks) < 0)
                        self.settings.showBlocks.push(input.show[i]);
                }
            }
            if(input.tmpl){
                self.settings.tmplPath = 'userInformation/' + input.tmpl + '.html';
            }
        }
    };
    self.GetTmplRoute = function(){
        return self.settings.tmplPath + self.settings.tmplId + '.html';
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                EventDispatcher.DispatchEvent('onload.userInformation.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                    EventDispatcher.DispatchEvent('onload.userInformation.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('onload.userInformation.tmpl', function (){
            self.BaseLoad.Login(false, false, false, function(data){
                self.CheckAuthorization(data);
            });
        });
        
        EventDispatcher.AddEventListener('widget.authentication.ok', function(data){
               self.CheckAuthorization(data.request);
        });
        
        EventDispatcher.AddEventListener('UserInformationWidget.click.logout', function(){
            self.BaseLoad.Logout(function(data){
                if(data.result == 'ok' || data.result == 'fail'){
                    Routing.SetHash('catalog', 'Домашняя', {});
                }
            });
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            EventDispatcher.DispatchEvent('onload.userInformation.tmpl');
        });
    };
    self.CheckAuthorization = function(data){
        if(!data.err){
            self.InsertContainer.InfoBlock();
            self.Fill.InfoBlock(data);
        }
        else{
            self.InsertContainer.AuthBlock();
            self.Fill.AuthBlock();
        }
    };
    self.InsertContainer = {
        AuthBlock : function(){
            $("#" + self.settings.containerId).empty().append($('script#' + self.settings.authTmplId).html());
        },
        InfoBlock : function(){
            $("#" + self.settings.containerId).empty().append($('script#' + self.settings.infoTmplId).html());
        }
    };
    self.Fill = {
        AuthBlock : function(){
            var block = new UserAuthorizationBlockViewModel();
            self.Render.AuthBlock(block);
        },
        InfoBlock : function(data){
            var block = new UserInformationBlockViewModel(data);
            self.Render.InfoBlock(block);
        }
    };
    self.Render = {
        AuthBlock : function(data){
            if($("#" + self.settings.containerId).length > 0){
                ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
            }
            self.WidgetLoader(true);
        },
        InfoBlock : function(data){
            if($("#" + self.settings.containerId).length > 0){
                ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
            }
            self.WidgetLoader(true);
        }
    }
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            
            for(var key in self.settings.inputParameters){
                if(self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                if($("#" + self.settings.containerId).length > 0){
                    $("#" + self.settings.containerId).css(self.settings.style);
                }
            });
        }
    };
};

var UserAuthorizationBlockViewModel = function(){
    var self = this;
    self.ClickLogin = function(){
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
        Routing.SetHash('login', 'Авторизация пользователя', {});
    };
    self.ClickRegistration = function(){
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
        Routing.SetHash('registration', 'Регистрация пользователя', {step:1}); 
    };
};

var UserInformationBlockViewModel = function(data){
    var self = this;
    self.email = data.email;
    self.login = data.login;
    self.phone = data.phone;
    self.showIcon = function(){
        if(!data.route_icon_user || $.inArray('icon', Config.UserInformation.showBlocks) < 0)
            return false;
        return true;
    };
    self.iconUser = Parameters.pathToImages + data.route_icon_user;
    
    self.showRaiting = function(){
        if($.inArray('raiting', Config.UserInformation.showBlocks) < 0)
            return false;
        return true;
    };
    self.ratingUser = data.rating_user;
    
    self.ClickLogout = function(){
        if(confirm('Вы действительно хотите выйти?')){
            Loader.Indicator('UserInformationWidget', false);
            EventDispatcher.DispatchEvent('UserInformationWidget.click.logout');
        }
    };
    self.ClickPrivateOffice = function(){
        Routing.SetHash('profile', 'Личный кабинет', {});
    };
};

var TestUserInformation = {
    Init : function(){
        if(typeof Widget == 'function'){
            UserInformationWidget.prototype = new Widget();
            var information = new UserInformationWidget();
            information.Init(information);
        }
        else{
            setTimeout(function(){TestUserInformation.Init()}, 100);
        }
    }
}

TestUserInformation.Init();


