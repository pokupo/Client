var MessageWidget = function() {
    var self = this;
    self.widgetName = 'MessageWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        tmpl : {
            path: null,
            id : {
                content : null,
                empty : null
            }
        },
        inputParameters: {},
        paging : null,
        style: null,
        containerId: null,
        customContainer: null
    };
    self.InitWidget = function() {
        self.settings.containerId = Config.Containers.message.widget;
        self.settings.customContainer = Config.Containers.message.customClass;
        self.settings.tmpl = Config.Message.tmpl;
        self.settings.paging = Config.Paging;
        self.settings.style = Config.Message.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.CheckRouteMessage();
        self.SetPosition();
    };
    self.SetInputParameters = function() {
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/MessageWidget/);
            if(temp.message){
                input = temp.message;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.message){
            input = WParameters.message;
        }
        
        if(!$.isEmptyObject(input)){
            self.settings.paging.itemsPerPage = input.defaultCount;
        }
        
        self.settings.inputParameters = input;
    };
    self.CheckRouteMessage = function(){
        if (Routing.route == 'messages') {
            self.BaseLoad.Login(false, false, false, function(data){
                if(!data.err){
                    self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                        self.Update.Menu();
                        self.Update.Content();
                    });
                }
                else{
                    Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
                    Routing.SetHash('login', 'Авторизация пользователя', {});
                    self.WidgetLoader(true);
                }  
            });
        }
        else {
            self.WidgetLoader(true);
        }
    };
    self.Update = {
        Content: function() {
            self.WidgetLoader(false);
            if(!Routing.params.block)
                Routing.params.block = 'topic'
            
            if (Routing.params.block == 'topic') {
                self.Fill.Topic();
                self.currentPage = Routing.GetCurrentPage();
            }
            else if (Routing.params.block == 'list' && Routing.params.id)
                self.Fill.List(Routing.params.id);
        },
        Menu: function() {
            Loader.Indicator('MenuPersonalCabinetWidget', false);
            self.BaseLoad.Script('widgets/MenuPersonalCabinetWidget-1.1.js', function() {
                EventDispatcher.DispatchEvent('widget.onload.menuPersonalCabinet');
            });
        }
    };
    self.RegisterEvents = function(){
        EventDispatcher.AddEventListener('widget.change.route', function() {
            self.CheckRouteMessage();
        });
        
        EventDispatcher.AddEventListener('MessageWidget.check.login', function(form){
            self.BaseLoad.UniqueUser('?username=' + encodeURIComponent(form.dstUser()), function(request){
                if(request.check_username != 'on' && request.check_username != 'off')
                    form.dstUserError(Config.Message.error.username.notFound);
                else
                    form.dstUserError('');
            })
        });
        
        EventDispatcher.AddEventListener('MessageWidget.add.message', function(topic){
            var form = topic.modalForm();

            self.BaseLoad.UniqueUser('?username=' + encodeURIComponent(form.dstUser()), function(request){
                if(request.check_username != 'on' && request.check_username != 'off'){
                    form.dstUserError(Config.Message.error.username.notFound);
                }
                else{
                    
                    form.dstUserError('');
                    var str = '?name_topic=' + encodeURIComponent(form.topicName()) + '&dst_user=' + encodeURIComponent(form.dstUser()) + '&text_message=' + encodeURIComponent(form.text()) + '&copy_mail=' + (form.copyMail() ? 'yes' : 'no');
                    self.BaseLoad.MessageAdd(str, function(data){
                        console.log(data); 
                    });
                }
            })
        });
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.containerId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerId).empty().html(temp);
        },
        Topic : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('topic')).html()).children().hide();
        },
        list : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('list')).html()).children().hide();
        },
        EmptyList : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('empty')).html()).children().hide(); 
        }
    };
    self.Fill = {
        Topic : function(){
            var start = (Routing.GetCurrentPage()-1) * self.settings.paging.itemsPerPage;
            var query = start + '/' + self.settings.paging.itemsPerPage;
            self.BaseLoad.TopicList(query, function(data){
                    if(!data.err){
                        var content = new TopicMessageViewModel(self.settings);
                        content.AddContent(data.content);
                    }
                    else{
                        var content = new TopicMessageViewModel(self.settings);
                        var msg = Config.Message.message.noReult;
                        if(data.msg)
                            msg = data.msg;
                        content.SetErrorMessage(msg);
                        
                        self.InsertContainer.EmptyList();
                        self.Render.EmptyList(content);
                    }
            });
        },
        List : function(id){
            
        }
    };
    self.Render = {
        Topic : function(data){
            if($("#" + self.settings.containerId).length > 0){
//                try{
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    self.WidgetLoader(true, self.settings.containerId);
//                }
//                catch(e){
//                    self.Exeption('Ошибка шаблона [' + self.GetTmplName('topic') + ']');
//                    if(self.settings.tmpl.custom){
//                        delete self.settings.tmpl.custom;
//                        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
//                            self.InsertContainer.Topic();
//                            self.Render.Topic(data);
//                        });
//                    }
//                    else{
//                        self.InsertContainer.EmptyWidget();
//                        self.WidgetLoader(true, self.settings.containerId);
//                    }
//                }
            }
        },
        List : function(data){
            if($("#" + self.settings.containerId).length > 0){
                try{
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    self.WidgetLoader(true, self.settings.containerId);
                }
                catch(e){
                    self.Exeption('Ошибка шаблона [' + self.GetTmplName('list') + ']');
                    if(self.settings.tmpl.custom){
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                            self.InsertContainer.List();
                            self.Render.List(data);
                        });
                    }
                    else{
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerId);
                    }
                }
            }
        },
        EmptyList : function(data){
            if($("#" + self.settings.containerId).length > 0){
//                try{
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    self.WidgetLoader(true, self.settings.containerId);
                    
//                }
//                catch(e){
//                    self.Exeption('Ошибка шаблона [' + self.GetTmplName('empty') + ']');
//                    if(self.settings.tmpl.custom){
//                        delete self.settings.tmpl.custom;
//                        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
//                            self.InsertContainer.EmptyList();
//                            self.Render.EmptyList(data);
//                        });
//                    }
//                    else{
//                        self.InsertContainer.EmptyWidget();
//                        self.WidgetLoader(true, self.settings.containerId);
//                    }
//                }
            }
        },
        EmptyWidget : function(){
            self.WidgetLoader(true, self.settings.containerId);
        }
    };
    self.SetPosition = function() {
        if (self.settings.inputParameters['position'] == 'absolute') {
            for (var key in self.settings.inputParameters) {
                if (self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function() {
                if ($('#' + self.settings.containerId).length > 0)
                    $('#' + self.settings.containerId).css(self.settings.style);
            });
        }
    };
};

var TopicMessageViewModel = function(settings){
    var self = this;
    self.animate = new AnimateMessage();
    self.messageError = ko.observable();
    self.messages = ko.observableArray();
    self.paging = ko.observableArray();
    self.countAll = null;
    self.modalForm = ko.observable(new FormMessageViewModel(self));

    self.SetErrorMessage = function(message){
        self.messageError(message); 
    };
    self.ClickAdd = function(){
        self.animate.Init(self.modalForm().idForm)
    };
    self.ClickRead = function(){
        
    };
    self.ClickDelete = function(){
        
    };
    self.AddContent = function(data){
        
        self.AddPages();
    };
    self.AddPages = function(){
        var ClickLinkPage = function(){
            Loader.Indicator('MessageWidget', false);

            Routing.UpdateHash({page : this.pageId});
        }
        
        self.paging = Paging.GetPaging(self.countAll, settings, ClickLinkPage);
    }
};

var FormMessageViewModel = function(topic){
    var self = this;
    self.idForm = 'newMessage';
    
    self.dstUser = ko.observable();
    self.dstUserError = ko.observable();
    
    self.topicName = ko.observable();
    self.topicNameError = ko.observable();
    
    self.text = ko.observable();
    self.textError = ko.observable();
    
    self.copyMail = ko.observable();
    
    self.ClickSend = function(){
        if(self.Validate()){
            EventDispatcher.DispatchEvent('MessageWidget.add.message', topic);
        }
    };
    self.ClickCancel = function(){
        topic.animate.Close();
        self.dstUser('');
        self.dstUserError('');
        self.topicName('');
        self.topicNameError('');
        self.text('');
        self.textError('');
        self.copyMail('');
    };
    self.OnBlurEvent  = function(){
        EventDispatcher.DispatchEvent('MessageWidget.check.login', self);
    };
    self.Validate = function(){
        if(!self.dstUser())
            self.dstUserError(Config.Message.error.username.empty);
        else
            self.dstUserError();

        if(!self.topicName())
            self.topicNameError(Config.Message.error.topic.empty);
        else
            self.topicNameError('');
        
        if(!self.text())
            self.textError(Config.Message.error.text.empty);
        else
            self.textError();
        
        if(self.dstUserError() || self.topicNameError() || self.textError())
            return false
        
        return true;
    }
}

var TestMessage = {
    Init: function() {
        if (typeof Widget == 'function') {
            MessageWidget.prototype = new Widget();
            var message = new MessageWidget();
            message.Init(message);
        }
        else {
            setTimeout(function() {
                TestMessage.Init();
            }, 100);
        }
    }
};



TestMessage.Init();

