var MessageWidget = function () {
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
        animate: null,
        inputParameters: {},
        paging: null,
        style: null,
        containerId: null,
        customContainer: null
    };
    self.InitWidget = function () {
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
    self.SetInputParameters = function () {
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
            if(input.defaultCount)
                self.settings.paging.itemsPerPage = input.defaultCount;
            if(input.animate)
                self.settings.animate = input.animate;
        }

        self.settings.inputParameters = input;
    };
    self.CheckRouteMessage = function () {
        if (Routing.route == 'messages') {
            self.BaseLoad.Login(false, false, false, function (data) {
                if (!data.err) {
                    self.BaseLoad.Tmpl(self.settings.tmpl, function () {
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
        Content: function () {
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
        Menu: function () {
            self.BaseLoad.Script('widgets/MenuPersonalCabinetWidget-1.1.js', function () {
                EventDispatcher.DispatchEvent('w.onload.menu', {menu : {}, active : ''});
            });
        }
    };
    self.RegisterEvents = function () {
        EventDispatcher.AddEventListener('w.change.route', function () {
            self.CheckRouteMessage();
        });

        EventDispatcher.AddEventListener('MessageWidget.check.login', function (form) {
            self.BaseLoad.UniqueUser('?username=' + encodeURIComponent(form.dstUser()), function (request) {
                if (request.check_username != 'on' && request.check_username != 'off')
                    form.dstUserError(Config.Message.error.username.notFound);
                else
                    form.dstUserError('');
            })
        });

        EventDispatcher.AddEventListener('MessageWidget.search.message', function (text) {
            self.Fill.Topic(text);
        });

        EventDispatcher.AddEventListener('MessageWidget.add.message', function (topic) {
            var form = topic.modalForm();

            self.BaseLoad.UniqueUser('?username=' + encodeURIComponent(form.dstUser()), function (request) {
                if (request.check_username != 'on' && request.check_username != 'off') {
                    form.dstUserError(Config.Message.error.username.notFound);
                }
                else {
                    form.dstUserError('');
                    self.BaseLoad.MessageAdd($('form#'+ form.cssFormMessage), function (data) {
                        if(!data.err){
                            self.Fill.Topic()
                        }
                        else {
                            self.QueryError(data, function () {
                                EventDispatcher.DispatchEvent('MessageWidget.add.message', topic)
                            });
                        }
                    });
                }
            })
        });

        EventDispatcher.AddEventListener('MessageWidget.read.topic', function (topicArray) {
            for (var i = 0; i <= topicArray.length - 1; i++) {
                self.BaseLoad.TopicRead(topicArray[i].idTopic(), function (data) {
                    if (data.result != 'ok') {
                        self.QueryError(data, function () {
                            EventDispatcher.DispatchEvent('MessageWidget.read.topic', topicArray)
                        });
                    }
                    else
                        EventDispatcher.DispatchEvent('w.change.count.mess');
                });
            }
        });

        EventDispatcher.AddEventListener('MessageWidget.delete.topic', function (topicArray) {
            for (var i = 0; i <= topicArray.length - 1; i++) {
                self.BaseLoad.TopicDelete(topicArray[i].idTopic(), function (data) {
                    if (data.result != 'ok') {
                        self.ShowMessage(Config.Message.message.error, function () {
                            Routing.SetHash('messages', 'Сообщения', {});
                        }, false);
                    }
                    else
                        EventDispatcher.DispatchEvent('w.change.count.mess');
                });
            }
        });
        
        EventDispatcher.AddEventListener('MessageWidget.delete.oneTopic', function (topicId) {
            self.Confirm(Config.Message.message.confirmDeleteTopic, function () {
                self.BaseLoad.TopicDelete(topicId, function (data) {
                    if (data.result != 'ok') {
                        self.ShowMessage(Config.Message.message.error, function () {
                        }, false);
                    }
                    else{
                        EventDispatcher.DispatchEvent('w.change.count.mess');
                        Routing.SetHash('messages', 'Сообщения', {});
                    }
                });
            });
        });

        EventDispatcher.AddEventListener('MessageWidget.read.message', function (message, topic) {
            self.BaseLoad.MessageSetRead(message.id(), function (data) {
                if (data.result != 'ok') {
                    self.ShowMessage(Config.Message.message.error, function () {
                        Routing.SetHash('messages', topic.nameTopic(), {block: 'list', id: topic.topicId()});
                    }, false);
                }
                else
                    EventDispatcher.DispatchEvent('w.change.count.mess');
            });
        });

        EventDispatcher.AddEventListener('MessageWidget.unread.message', function (message, topic) {
            self.BaseLoad.MessageSetUnread(message.id(), function (data) {
                if (data.result != 'ok') {
                    self.ShowMessage(Config.Message.message.error, function () {
                        Routing.SetHash('messages', topic.nameTopic(), {block: 'list', id: topic.topicId()});
                    }, false);
                }
                else
                    EventDispatcher.DispatchEvent('w.change.count.mess');
            });
        });

        EventDispatcher.AddEventListener('MessageWidget.reply.message', function (form) {
            self.BaseLoad.MessageAdd($('form#'+ form.cssFormMessage), function (data) {
                        
                if (!data.err) {
                    var newMessage = new MessageViewModel(data, form.topic);
                    form.topic.messages.push(newMessage);
                    newMessage.ClickExpand();
                    form.ClickCancel();
                }
                else {
                    self.QueryError(
                            data,
                            function () {
                                EventDispatcher.DispatchEvent('MessageWidget.reply.message', form)
                            },
                            function () {
                                form.ClearForm()
                            });
                }
            });
        });
        
        EventDispatcher.AddEventListener('MessageWidget.empty.topic', function () {
            self.Fill.Topic();
        })
    };
    self.InsertContainer = {
        EmptyWidget: function () {
            var temp = $("#" + self.settings.containerId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerId).empty().html(temp);
        },
        Topic: function () {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('topic')).html()).children().hide();
        },
        List: function () {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('list')).html()).children().hide();
        },
        EmptyList: function () {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('empty')).html()).children().hide();
        }
    };
    self.Fill = {
        Topic: function (text) {
            var start = (Routing.GetCurrentPage() - 1) * self.settings.paging.itemsPerPage;
            var query = start + '/' + self.settings.paging.itemsPerPage;
            if (text)
                query = query + '/' + encodeURIComponent(text);
            self.BaseLoad.TopicList(query, function (data) {
                TopicMessageViewModel.prototype = new Widget();
                var content = new TopicMessageViewModel(self);
                if (!data.err) {
                    content.AddContent(data);
                    if (text)
                        content.searchMessage(text);

                    self.InsertContainer.Topic();
                    self.Render.Topic(content);
                }
                else {
                    var msg = Config.Message.message.noResult;
                    if (data.msg)
                        msg = data.msg;
                    content.SetErrorMessage(msg);
                    if (text)
                        content.searchMessage(text);

                    self.InsertContainer.EmptyList();
                    self.Render.EmptyList(content);
                }
            });
        },
        List: function (id) {
            var fullInfo = 'unread';
            if (Routing.params.info)
                fullInfo = Routing.params.info;
            self.BaseLoad.TopicInfo(id, fullInfo, function (data) {
                var content = new ListMessageViewModel();
                content.AddContent(data);

                self.InsertContainer.List();
                self.Render.List(content);
            });
        }
    };
    self.Render = {
        Topic: function (data) {
            if ($("#" + self.settings.containerId).length > 0) {
                try{
                    ko.cleanNode($("#" + self.settings.containerId)[0]);
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    self.WidgetLoader(true, self.settings.containerId);
                    if(typeof AnimateMessage == 'function')
                        new AnimateMessage();
                    if(self.settings.animate)
                        self.settings.animate();
                }
                catch(e){
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('topic') + ']', e);
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
            else{
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId + ']');
                self.WidgetLoader(true, self.settings.containerId);
            }
        },
        List: function (data) {
            if ($("#" + self.settings.containerId).length > 0) {
                try {
                    ko.cleanNode($("#" + self.settings.containerId)[0]);
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    self.WidgetLoader(true, self.settings.containerId);
                    if(typeof AnimateMessage == 'function')
                        new AnimateMessage();
                    if(self.settings.animate)
                        self.settings.animate();

                    var messages = data.messages();
                    var newMessages = [];
                    $.each(messages, function (i) {
                        if (messages[i].IsNew() && !messages[i].IsMy()) {
                            messages[i].ClickExpand();
                            newMessages.push(messages[i]);
                        }
                    });

                    if (messages.length == newMessages.length) {
                        $('.' + messages.cssExpandAll).hide();
                        $('.' + messages.cssCollapseAll).show();
                    }

                    var timeout = 0;
                    $.each(newMessages, function (i) {
                        setTimeout(function () {
                            newMessages[i].InitTimer()
                        }, timeout);
                        timeout = timeout + newMessages[i].timeout;
                    });
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('list') + ']');
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function() {
                            self.InsertContainer.List();
                            self.Render.List(data);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerId);
                    }
                }
            }
            else{
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId + ']');
                self.WidgetLoader(true, self.settings.containerId);
            }
        },
        EmptyList: function (data) {
            if ($("#" + self.settings.containerId).length > 0) {
                try {
                    ko.cleanNode($("#" + self.settings.containerId)[0]);
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    self.WidgetLoader(true, self.settings.containerId);
                    if(typeof AnimateMessage == 'function')
                        new AnimateMessage();
                    if(self.settings.animate)
                        self.settings.animate();
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('empty') + ']');
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                            self.InsertContainer.EmptyList();
                            self.Render.EmptyList(data);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerId);
                    }
                }
            }
            else{
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId + ']');
                self.WidgetLoader(true, self.settings.containerId);
            }
        },
        EmptyWidget: function () {
            self.WidgetLoader(true, self.settings.containerId);
        }
    };
    self.SetPosition = function () {
        if (self.settings.inputParameters['position'] == 'absolute') {
            for (var key in self.settings.inputParameters) {
                if (self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function () {
                if ($('#' + self.settings.containerId).length > 0)
                    $('#' + self.settings.containerId).css(self.settings.style);
            });
        }
    };
};

var TopicMessageViewModel = function (widget) {
    var self = this;
    self.messageError = ko.observable();
    self.messages = ko.observableArray();
    self.paging = null;
    self.countAll = ko.observable();
    self.countNewMessage = ko.computed(function () {
        return Parameters.cache.message.countNewMessage();
    }, this);
    self.modalForm = ko.observable(new FormMessageViewModel(self));
    self.cssSelectAll = "messagesSelectAll";
    self.isSelectedAll = ko.observable(false);
    self.isSelectedAll.subscribe(function(check) {
        ko.utils.arrayForEach(self.messages(), function(messages) {
            $('#' + messages.cssCheckboxMessage() )[0].checked = check;
            messages.isSelected(check);
        });
    });
    self.searchMessage = ko.observable();

    self.SetErrorMessage = function (message) {
        self.messageError(message);
    };
    self.GetSelected = function () {
        var topicArray = [];
        ko.utils.arrayForEach(self.messages(), function (message) {
            if (message.isSelected())
                topicArray.push(message);
        });

        return topicArray;
    };
    self.ClickSearch = function () {
        EventDispatcher.DispatchEvent('MessageWidget.search.message', self.searchMessage());
    };
    self.ClickRead = function () {
        var selected = self.GetSelected();
        var real = [];
        $.each(selected, function (i) {
            if (!selected[i].IsMy() && selected[i].IsNew()) {
                selected[i].SetStatus('read');
                real[i] = selected[i];
            }
            selected[i].isSelected(false);
        });
        if(real.length > 0){
            EventDispatcher.DispatchEvent('MessageWidget.read.topic', real);
        }
    };
    self.ClickDelete = function () {
        self.Confirm(Config.Message.message.confirmDeleteSeveralTopic, function () {
            var selected = self.GetSelected();
            $.each(selected, function (i) {
                self.messages.remove(selected[i]);
            });
            EventDispatcher.DispatchEvent('MessageWidget.delete.topic', selected);
            if(self.messages().length == 0)
                EventDispatcher.DispatchEvent('MessageWidget.empty.topic');
        });
    };
    self.AddContent = function (data) {
        var last = data.shift()
        self.countAll(last.count_topic);

        $.each(data, function (i) {

            self.messages.push(self.NewTopic(data[i]));
        });

        self.AddPages();
    };
    self.AddNewInContent = function (data) {
        self.messages.unshift(self.NewTopic(data));
    };
    self.NewTopic = function (data) {
        TopicViewModel.prototype = new Widget();
        return new TopicViewModel(data, self);
    };
    self.AddPages = function () {
        var ClickLinkPage = function () {
            Loader.Indicator('MessageWidget', false);
            Routing.UpdateHash({page: this.pageId});
        };
        self.paging = Paging.GetPaging(self.countAll(), widget.settings, ClickLinkPage);
    };
    self.ClickSelectAll = function () {
        var all = $('#' + self.cssSelectAll);
        var check = all.is(':checked');
        var val;
        if (check) {
            all[0].checked = false;
            val = false;
        }
        else {
            all[0].checked = true;
            val = true;
        }

        ko.utils.arrayForEach(self.messages(), function (message) {
            $('#' + message.cssCheckboxMessage())[0].checked = val;
            message.isSelected(val);
        });
    };
};

var TopicViewModel = function (data, list) {
    var self = this;
    self.id = data.id;
    self.dateMessage = ko.observable(data.date_message);
    self.nameTopic = ko.observable(data.name_topic);
    self.idTopic = ko.observable(data.id_topic);
    self.srcUser = ko.observable(data.src_user);
    self.dstUser = ko.observable(data.dst_user);
    self.logoSrcUser = ko.observable(data.logo_src_user);
    self.logoDstUser = ko.observable(data.logo_dst_user);
    self.textMessage = ko.observable(data.text_message);
    self.status = ko.observable(data.status);
    self.countMessage = ko.observable(data.count_message);
    self.copyMail = ko.observable(data.copyMail);
    self.cssCheckboxMessage = ko.observable('message_item_' + self.id);
    self.isSelected = ko.observable(false);
    self.isSelected.subscribe(function(check) {
        var count = list.messages().length;
        var selected = [];
        
        for(var i = 0; i <= count-1; i++) {
            if(list.messages()[i].isSelected())
              selected.push(list.messages()[i].id);
        };
        if(selected.length < count)
            $('#' + list.cssSelectAll )[0].checked = false;
        else
            $('#' + list.cssSelectAll )[0].checked = true;
        $('#' + self.cssCheckboxMessage() )[0].checked = check;
    });

    self.IsMy = ko.computed(function () {
        var user = Parameters.cache.userInformation;
        if (user.login == self.srcUser())
            return true;
        return false;
    }, this);
    self.IsNew = ko.computed(function () {
        if (self.status() == 'send' && !self.IsMy())
            return true;
        return false;
    }, this);
    self.SetStatus = function (status) {
        self.status(status);
    };
    self.ClickTopic = function () {
        Routing.SetHash('messages', self.nameTopic(), {block: 'list', id: self.idTopic()})
    };
    self.ClickCheckboxMessage = function (message, elem) {
        var $checkBox = $('#' + message.cssCheckboxMessage());
        var isChecked = $checkBox.is(':checked');
        if (isChecked == false) {
            $checkBox[0].checked = true;
            self.isSelected(true);
        }
        else {
            $checkBox[0].checked = false;
            self.isSelected(false);
        }
    };
    self.ClickDelete = function () {
        self.Confirm(Config.Message.message.confirmDeleteSeveralTopic, function () {
            EventDispatcher.DispatchEvent('MessageWidget.delete.topic', [self]);
            list.messages.remove(self);
            if(list.messages().length == 0)
                EventDispatcher.DispatchEvent('MessageWidget.empty.topic');
        });
    };
    self.FormatDateMessage = function () {
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
};

var FormMessageViewModel = function (topic) {
    var self = this;

    self.dstUser = ko.observable();
    self.dstUserError = ko.observable();

    self.topicName = ko.observable();
    self.topicNameError = ko.observable();

    self.text = ko.observable();
    self.textError = ko.observable();

    self.copyMail = ko.observable();
    self.cssFormMessage = 'simple_form_message';

    self.ClickSend = function () {
        if (self.Validate()) {
            EventDispatcher.DispatchEvent('MessageWidget.add.message', topic);
        }
    };
    self.ClickCancel = function () {
        self.ClearForm();
    };
    self.ClearForm = function () {
        self.dstUser('');
        self.dstUserError('');
        self.topicName('');
        self.topicNameError('');
        self.text('');
        self.textError('');
        self.copyMail('');
    };
    self.OnBlurEvent = function () {
        EventDispatcher.DispatchEvent('MessageWidget.check.login', self);
    };
    self.Validate = function () {
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

var SimpleFormMessageViewModel = function (data) {
    var self = this;
    self.text = ko.observable();
    self.textError = ko.observable();
    self.topic = data;
    self.copyMail = ko.observable(false);
    self.cssFormMessage = 'simple_form_message';

    self.ClickSend = function () {
        if (self.Validate()) {
            EventDispatcher.DispatchEvent('MessageWidget.reply.message', self);
        }
    };
    self.ClickCancel = function () {
        $('#' + self.cssSimpleFormMessage).hide(200);
        self.ClearForm();
    };
    self.ClearForm = function () {
        self.text('');
        self.textError('');
        self.copyMail(false);
    };
    self.Validate = function () {
        if (!self.text())
            self.textError(Config.Message.error.text.empty);
        else
            self.textError();

        if (self.textError())
            return false
        return true;
    };
};

var ListMessageViewModel = function () {
    var self = this;
    self.topicId = ko.observable();
    self.nameTopic = ko.observable();
    self.messages = ko.observableArray();
    self.simpleForm = new SimpleFormMessageViewModel(self);
    self.cssExpandAll = 'expand';
    self.cssCollapseAll = 'collapse';

    self.AddContent = function (data) {
        self.topicId(data.id_topic);
        self.nameTopic(data.name_topic);
        $.each(data.messages, function (i) {
            self.messages.push(new MessageViewModel(data.messages[i], self));
        });
    };
    self.ClickBack = function () {
        Routing.SetHash('messages', 'Сообщения', {block: 'topic', page: Routing.GetLastPageNumber()});
    };
    self.ClickDelete = function(){
        EventDispatcher.DispatchEvent('MessageWidget.delete.oneTopic', self.topicId());
    };
    self.ClickExpand = function () {
        var newMessages = [];
        if ($('.' + self.cssExpandAll))
            $('.' + self.cssExpandAll).hide();
        if ($('.' + self.cssCollapseAll))
            $('.' + self.cssCollapseAll).show();

        $.each(self.messages(), function (i) {
            self.messages()[i].ClickExpand();
            if (self.messages()[i].status() == 'send' && !self.messages()[i].IsMy())
                newMessages.push(self.messages()[i]);
        })
        var timeout = 0;
        $.each(newMessages, function (i) {
            setTimeout(function () {
                newMessages[i].InitTimer()
            }, timeout);
            timeout = timeout + newMessages[i].timeout;
        });
    };
    self.ClickCollapse = function () {
        $('.' + self.cssExpandAll).show();
        $('.' + self.cssCollapseAll).hide();
        $.each(self.messages(), function (i) {
            self.messages()[i].ClickCollapse();
            if (self.messages()[i].status() == 'send' && !self.messages()[i].IsMy())
                self.messages()[i].stopTime = true;
        })
    };
};

var MessageViewModel = function (data, topic) {
    var self = this;
    self.id = ko.observable(data.id);
    self.copyMail = ko.observable(data.copy_mail);
    self.dateMessage = ko.observable(data.date_message);
    self.dstUser = ko.observable(data.dst_user);
    self.logoDstUser = ko.observable(data.logo_dst_user);
    self.srcUser = ko.observable(data.src_user);
    self.logoSrcUser = ko.observable(data.logo_src_user);
    self.status = ko.observable(data.status);
    self.textMessage = ko.observable(data.text_message);
    self.time = 0;
    self.timeout = data.text_message.length / 250 * Config.Message.timer;
    self.stopTime = false;

    self.IsNew = ko.computed(function () {
        if (self.status() == 'send')
            return true;
        return false;
    }, this);
    self.IsMy = ko.computed(function () {
        var user = Parameters.cache.userInformation;
        if (user.login == self.srcUser())
            return true;
        return false;
    }, this);
    self.cssPrevieClear = 'previe_message_' + self.id();
    self.cssPrevie = ko.computed(function () {
        var str = self.cssPrevieClear;
        if (self.IsNew())
            str = str + ' new';
        return str;
    }, this);
    self.cssFull = 'full_message_' + self.id();
    self.isExpand = ko.observable(false);

    self.SetStatus = function (status) {
        self.status(status);
    };
    self.FormatDateMessage = function () {
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

    self.ClickReply = function () {
        var id = topic.simpleForm.cssSimpleFormMessage;
        $('#' + id).show(200);
        $('#' + id)[0].scrollIntoView(250);
    };
    self.ClickRead = function () {
        if (!self.IsMy()) {
            EventDispatcher.DispatchEvent('MessageWidget.read.message', self, topic);
            self.SetStatus('read');
        }
    };
    self.ClickUnread = function () {
        EventDispatcher.DispatchEvent('MessageWidget.unread.message', self, topic);
        self.SetStatus('send');
    };
    self.ClickExpand = function () {
        self.isExpand(true);
        $('.' + self.cssPrevieClear).hide();
        $('.' + self.cssFull).show();
        if (self.status() == 'send') {
            self.time = 0;
            self.stopTime = false;
            self.InitTimer();
        }
    };
    self.ClickCollapse = function () {
        self.isExpand(false);
        $('.' + self.cssPrevieClear).show();
        $('.' + self.cssFull).hide();
        self.stopTime = true;
    };
    self.InitTimer = function () {
        setTimeout(function () {
            if (!self.stopTime) {
                self.time = self.time + 1;
                if (self.time >= self.timeout) {
                    self.ClickRead();
                    return true;
                }
                else
                    self.InitTimer();
            }
        }, 1000);

        return false;
    };
};

var TestMessage = {
    Init: function () {
        if (typeof Widget == 'function') {
            MessageWidget.prototype = new Widget();
            var message = new MessageWidget();
            message.Init(message);
        }
        else {
            setTimeout(function () {
                TestMessage.Init();
            }, 100);
        }
    }
};



TestMessage.Init();

