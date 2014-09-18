var AuthenticationViewModel = function(){
    var self= this;
    self.username = null;
    self.password = null;
    self.rememberMe = null;
    self.error = null;
    self.subminEvent = ko.observable();
    
    self.Login = function(data){
        self.username = $(data.username).val();
        self.password = $(data.password).val();
        self.rememberMe = $(data.remember_me).is(':checked') ? 'on' : 'off';
        EventDispatcher.DispatchEvent(self.subminEvent(), self);
    };
    self.ClickRegistration = function(){
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
        Routing.SetHash('registration', 'Регистрация пользователя', {step:1});
    };
    self.ClickZPayment = function(){
        
    };
    self.ForgotPassword = function(){
        window.location.href = 'https://' + window.location.hostname + '/resetting/request'
    };
    self.CloseForm = function(){
        EventDispatcher.DispatchEvent('widget.authentication.close');
    };
};

