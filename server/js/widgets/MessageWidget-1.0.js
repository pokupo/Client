var MessageWidget = function() {
    var self = this;
    self.widgetName = 'MessageWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        tmpl: {
            path: null,
            id: {
                content: null,
                empty: null
            }
        },
        inputParameters: {},
        paging: null,
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
        if (Config.Base.sourceParameters == 'string') {
            var temp = JSCore.ParserInputParameters(/MessageWidget/);
            if (temp.message) {
                input = temp.message;
            }
        }
        if (Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.message) {
            input = WParameters.message;
        }

        if (!$.isEmptyObject(input)) {
            self.settings.paging.itemsPerPage = input.defaultCount;
        }

        self.settings.inputParameters = input;
    };
    self.CheckRouteMessage = function() {
        if (Routing.route == 'messages') {
            self.BaseLoad.Login(false, false, false, function(data) {
                if (!data.err) {
                    self.BaseLoad.Tmpl(self.settings.tmpl, function() {
                        self.Update.Menu();
                        self.Update.Content();
                    });
                }
                else {
                    Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 1];
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
            if (!Routing.params.block)
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
    self.RegisterEvents = function() {
        EventDispatcher.AddEventListener('widget.change.route', function() {
            self.CheckRouteMessage();
        });

        EventDispatcher.AddEventListener('MessageWidget.check.login', function(form) {
            self.BaseLoad.UniqueUser('?username=' + encodeURIComponent(form.dstUser()), function(request) {
                if (request.check_username != 'on' && request.check_username != 'off')
                    form.dstUserError(Config.Message.error.username.notFound);
                else
                    form.dstUserError('');
            })
        });

        EventDispatcher.AddEventListener('MessageWidget.add.message', function(topic) {
            var form = topic.modalForm();

            self.BaseLoad.UniqueUser('?username=' + encodeURIComponent(form.dstUser()), function(request) {
                if (request.check_username != 'on' && request.check_username != 'off') {
                    form.dstUserError(Config.Message.error.username.notFound);
                }
                else {
                    form.dstUserError('');
                    var str = '?name_topic=' + encodeURIComponent(form.topicName()) + '&dst_user=' + encodeURIComponent(form.dstUser()) + '&text_message=' + encodeURIComponent(form.text()) + '&copy_mail=' + (form.copyMail() ? 'yes' : 'no');
                    self.BaseLoad.MessageAdd(str, function(data) {
                        data.count_message = 1;
                        topic.AddNewInContent(data);
                        topic.animate.Close();
                        form.ClearForm();
                    });
                }
            })
        });

        EventDispatcher.AddEventListener('MessageWidget.read.topic', function(topicArray) {
            for (var i = 0; i <= topicArray.length - 1; i++) {
                self.BaseLoad.TopicRead(topicArray[i].idTopic(), function(data) {
                    if (data.result != 'ok') {
                        self.ShowMessage(Config.Message.message.error, function() {
                            Routing.SetHash('message', 'Сообщения', {});
                        }, false);
                    }
                });
            }
        });

        EventDispatcher.AddEventListener('MessageWidget.delete.topic', function(topicArray) {
            for (var i = 0; i <= topicArray.length - 1; i++) {
                self.BaseLoad.TopicDelete(topicArray[i].idTopic(), function(data) {
                    if (data.result != 'ok') {
                        self.ShowMessage(Config.Message.message.error, function() {
                            Routing.SetHash('message', 'Сообщения', {});
                        }, false);
                    }
                });
            }
        });
    };
    self.InsertContainer = {
        EmptyWidget: function() {
            var temp = $("#" + self.settings.containerId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerId).empty().html(temp);
        },
        Topic: function() {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('topic')).html()).children().hide();
        },
        List: function() {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('list')).html()).children().hide();
        },
        EmptyList: function() {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('empty')).html()).children().hide();
        }
    };
    self.Fill = {
        Topic: function() {
            var start = (Routing.GetCurrentPage() - 1) * self.settings.paging.itemsPerPage;
            var query = start + '/' + self.settings.paging.itemsPerPage;
            self.BaseLoad.TopicList(query, function(data) {   
                TopicMessageViewModel.prototype = new Widget();
                var content = new TopicMessageViewModel(self.settings);
                if (!data.err) {
                    content.AddContent(data);

                    self.InsertContainer.Topic();
                    self.Render.Topic(content);
                }
                else {
                    var msg = Config.Message.message.noResult;
                    if (data.msg)
                        msg = data.msg;
                    content.SetErrorMessage(msg);

                    self.InsertContainer.EmptyList();
                    self.Render.EmptyList(content);
                }
            });
        },
        List: function(id) {
            var fullInfo = 'unread';
            if(Routing.params.info)
                fullInfo = Routing.params.info;
            self.BaseLoad.TopicInfo(id, fullInfo, function(data){
                var content = new ListMessageViewModel();
                content.AddContent(data);
                
                self.InsertContainer.List();
                self.Render.List(content);
            });
        }
    };
    self.Render = {
        Topic: function(data) {
            if ($("#" + self.settings.containerId).length > 0) {
                try{
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    self.WidgetLoader(true, self.settings.containerId);
                }
                catch(e){
                    self.Exeption('Ошибка шаблона [' + self.GetTmplName('topic') + ']');
                    if(self.settings.tmpl.custom){
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                            self.InsertContainer.Topic();
                            self.Render.Topic(data);
                        });
                    }
                    else{
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerId);
                    }
                }
            }
        },
        List: function(data) {
            if ($("#" + self.settings.containerId).length > 0) {
//                try {
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    self.WidgetLoader(true, self.settings.containerId);
                    var animate = new AnimateMessage();
                    animate.ListMessage();
//                }
//                catch (e) {
//                    self.Exeption('Ошибка шаблона [' + self.GetTmplName('list') + ']');
//                    if (self.settings.tmpl.custom) {
//                        delete self.settings.tmpl.custom;
//                        self.BaseLoad.Tmpl(self.settings.tmpl, function() {
//                            self.InsertContainer.List();
//                            self.Render.List(data);
//                        });
//                    }
//                    else {
//                        self.InsertContainer.EmptyWidget();
//                        self.WidgetLoader(true, self.settings.containerId);
//                    }
//                }
            }
        },
        EmptyList: function(data) {
            if ($("#" + self.settings.containerId).length > 0) {
                try{
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    self.WidgetLoader(true, self.settings.containerId);
                }
                catch(e){
                    self.Exeption('Ошибка шаблона [' + self.GetTmplName('empty') + ']');
                    if(self.settings.tmpl.custom){
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                            self.InsertContainer.EmptyList();
                            self.Render.EmptyList(data);
                        });
                    }
                    else{
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerId);
                    }
                }
            }
        },
        EmptyWidget: function() {
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

var TopicMessageViewModel = function(settings) {
    var self = this;
    self.animate = new AnimateMessage();
    self.messageError = ko.observable();
    self.messages = ko.observableArray();
    self.paging = null;
    self.countAll = ko.observable();
    self.modalForm = ko.observable(new FormMessageViewModel(self));
    self.cssSelectAll = "messagesSelectAll";
    self.isSelectedAll = ko.observable(false);

    self.SetErrorMessage = function(message) {
        self.messageError(message);
    };
    self.ClickAdd = function() {
        self.animate.Init(self.modalForm().idForm);
    };
    self.GetSelected = function() {
        var topicArray = [];
        ko.utils.arrayForEach(self.messages(), function(message) {
            if (message.isSelected())
                topicArray.push(message);
        })

        return topicArray;
    };
    self.ClickRead = function() {
        var selected = self.GetSelected();
        $.each(selected, function(i) {
            selected[i].status('read');
            selected[i].isSelected(false);
        });
        EventDispatcher.DispatchEvent('MessageWidget.read.topic', selected);
    };
    self.ClickDelete = function() {
        self.Confirm(Config.Message.message.confirmDeleteSeveralTopic, function() {
            var selected = self.GetSelected();
            $.each(selected, function(i) {
                self.messages.remove(selected[i]);
            });
            EventDispatcher.DispatchEvent('MessageWidget.delete.topic', selected);
        });
    };
    self.AddContent = function(data) {
        var last = data.shift()
        self.countAll(last.count_topic);
        
        $.each(data, function(i) {
            self.messages.push(new TopicViewModel(data[i]));
        });

        self.AddPages();
    };
    self.AddNewInContent = function(data) {
        self.messages.unshift(new TopicViewModel(data));
    };
    self.AddPages = function() {
        var ClickLinkPage = function() {
            Loader.Indicator('MessageWidget', false);
            Routing.UpdateHash({page: this.pageId});
        }
        
        self.paging = Paging.GetPaging(self.countAll(), settings, ClickLinkPage);
    }
    self.ClickSelectAll = function() {
        var check = $('#' + self.cssSelectAll).is(':checked');
        ko.utils.arrayForEach(self.messages(), function(message) {
            message.isSelected(check);
        });
    }
};

var TopicViewModel = function(data) {
    var self = this;
    self.id = data.id;
    self.dateMessage = ko.observable(data.date_message);
    self.nameTopic = ko.observable(data.name_topic);
    self.idTopic = ko.observable(data.id_topic);
    self.srcUser = ko.observable(data.src_user);
    self.dstUser = ko.observable(data.dst_user);
    self.logoSrcUser = ko.observable(Parameters.pathToImages + data.logo_src_user);
    self.logoDstUser = ko.observable(Parameters.pathToImages + data.logo_dst_user);
    self.textMessage = ko.observable(data.text_message);
    self.status = ko.observable(data.status);
    self.countMessage = ko.observable(data.count_message);
    self.copyMail = ko.observable(data.copyMail);
    self.isSelected = ko.observable(false);

    self.IsNew = ko.computed(function() {
        if (self.status() == 'send')
            return true;
        return false;
    }, this);
    self.ClickTopic = function(){
        Routing.SetHash('messages', self.nameTopic(), {block: 'list', id: self.idTopic()})
    };
    self.FormatDateMessage = function() {
        var d = self.dateMessage().split(' ');
        var m = d[0].split('-');
        var t = d[1].split(':');

        var date = new Date(m[2], m[1].replace(/^0+/, '') - 1, m[0].replace(/^0+/, ''), t[0].replace(/^0+/, ''), t[1].replace(/^0+/, ''), t[2].replace(/^0+/, ''));

        var dateNow = new Date();

        var period = (dateNow - date) / 1000 / 3600;
        if (period < 24 && date.getDay() == dateNow.getDay())
            return date.getHours() + ':' + self.PadPithZeroes(date.getMinutes(), 2);

        return date.getDate() + ' ' + Config.Base.toStringMonth[date.getMonth()];
    };
    self.PadPithZeroes = function(number, length) {
        var my_string = '' + number;
        while (my_string.length < length) {
            my_string = '0' + my_string;
        }

        return my_string;
    };
};

var FormMessageViewModel = function(topic) {
    var self = this;
    self.idForm = 'newMessage';

    self.dstUser = ko.observable();
    self.dstUserError = ko.observable();

    self.topicName = ko.observable();
    self.topicNameError = ko.observable();

    self.text = ko.observable();
    self.textError = ko.observable();

    self.copyMail = ko.observable();

    self.ClickSend = function() {
        if (self.Validate()) {
            EventDispatcher.DispatchEvent('MessageWidget.add.message', topic);
        }
    };
    self.ClickCancel = function() {
        topic.animate.Close();
        self.ClearForm();
    };
    self.ClearForm = function(){
        self.dstUser('');
        self.dstUserError('');
        self.topicName('');
        self.topicNameError('');
        self.text('');
        self.textError('');
        self.copyMail('');
    };
    self.OnBlurEvent = function() {
        EventDispatcher.DispatchEvent('MessageWidget.check.login', self);
    };
    self.Validate = function() {
        if (!self.dstUser())
            self.dstUserError(Config.Message.error.username.empty);
        else
            self.dstUserError();

        if (!self.topicName())
            self.topicNameError(Config.Message.error.topic.empty);
        else
            self.topicNameError('');

        if (!self.text())
            self.textError(Config.Message.error.text.empty);
        else
            self.textError();

        if (self.dstUserError() || self.topicNameError() || self.textError())
            return false

        return true;
    };
};

var SimpleFormMessageViewModel = function(data){
    var self = this;
    self.text = ko.observable();
    self.textError = ko.observable();
    self.topicId = ko.observable(data.topicId);
    self.copyMail = ko.observable(false);
    
    self.ClickSend = function(){
        
    };
    self.ClickCancel = function(){
        
    };
    self.ClearForm = function(){
        
    };
    self.Validate = function(){
        
    };
};

var ListMessageViewModel = function(){
    var self = this;
    self.topicId = ko.observable();
    self.nameTopic = ko.observable();
    self.messages = ko.observableArray();
    self.simpleForm = new SimpleFormMessageViewModel(self);
    
    self.AddContent = function(data){
        self.topicId(data.id_topic);
        self.nameTopic(data.name_topic);
        $.each(data.messages, function(i){
            self.messages.push(new MessageViewModel(data.messages[i]));
        });
    };
    self.ClickBack = function(){
        Routing.SetHash('messages', 'Сообщения', {block: 'topic'});
    };
    self.ClickExpand = function(){
        
    };
    self.ClickCollapse = function(){
        
    };
};

var MessageViewModel = function(data){
    var self = this;
    self.id = ko.observable(data.id);
    self.copyMail = ko.observable(data.copy_mail);
    self.dateMessage = ko.observable(data.date_message);
    self.dstUser = ko.observable(data.dst_user);
    self.logoDstUser = ko.observable(Parameters.pathToImages + data.logo_dst_user);
    self.srcUser = ko.observable(data.src_user);
    self.logoSrcUser = ko.observable(Parameters.pathToImages + data.logo_src_user);
    self.status = ko.observable(data.status);
    self.textMessage = ko.observable(data.text_message);
    
    self.IsNew = ko.computed(function() {
        if (self.status() == 'send')
            return true;
        return false;
    }, this);
    self.IsMy = ko.computed(function() {
        var user = Parameters.cache.userInformation;
        if(user.login == self.srcUser())
            return true;
        return false;
    }, this);
    self.FormatDateMessage = function() {
        var d = self.dateMessage().split(' ');
        var m = d[0].split('-');
        var t = d[1].split(':');

        var date = new Date(m[2], m[1].replace(/^0+/, '') - 1, m[0].replace(/^0+/, ''), t[0].replace(/^0+/, ''), t[1].replace(/^0+/, ''), t[2].replace(/^0+/, ''));

        var dateNow = new Date();

        var period = (dateNow - date) / 1000 / 3600;
        if (period < 24 && date.getDay() == dateNow.getDay())
            return date.getHours() + ':' + self.PadPithZeroes(date.getMinutes(), 2);

        return date.getDate() + ' ' + Config.Base.toStringMonth[date.getMonth()];
    };
    self.PadPithZeroes = function (number, length) {
        var my_string = '' + number;
        while (my_string.length < length) {
            my_string = '0' + my_string;
        }

        return my_string;
    };
    
    self.ClickReply = function(){
        
    };
    self.ClickExpand = function(){
        
    };
    self.ClickCollapse = function(){
        
    };
};

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

