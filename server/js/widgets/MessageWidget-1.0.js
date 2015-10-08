var MessageWidget = function () {
    var self = this;
    self.widgetName = 'MessageWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: {widget: 'content', def: 'defaultMessageWidgetId'},
        tmpl : {
            path : "messageTmpl.html", // файл шаблонов
            id : {
                topic : "messageTopicTmpl", //id шаблона списка тем
                list : "messageListTmpl", //id шаблона списка сообщений
                empty : 'messageEmptyListTmpl' //id шаблона пустого списка
            }
        },
        error : { // сообщения об ошибках при валидации формы регистрации
            username : {
                empty : 'Поле обязательно для заполнения',
                notFound : 'Получатель не найден.'
            },
            topic: {
                empty : 'Поле обязательно для заполнения'
            },
            text: {
                empty : 'Поле обязательно для заполнения'
            }
        },
        message : {
            noResult: "Писем нет :(",
            messageDelete : "Сообщение удалено.",
            topicDelete : "Тема Удалена.",
            severalTopicDelete : "Выбранные темы успешно удалены.",
            confirmDeleteMessage : 'Вы уверены, что хотите удалить сообщение?',
            confirmDeleteTopic : 'Вы уверены, что хотите удалить тему?',
            confirmDeleteSeveralTopic : 'Вы уверены, что хотите удалить выбранные темы?',
            error: 'Ошибка выполнения.'
        },
        timer : 10,
        animate: typeof AnimateMessage == 'function' ? AnimateMessage :null,
        paging: null
    };
    function InitWidget() {
        settings.paging = Config.Paging;
        RegisterEvents();
        SetInputParameters();
        CheckRouteMessage();
    }
    function SetInputParameters() {
        var input = self.GetInputParameters('message');

        if (!$.isEmptyObject(input)) {
            settings = self.UpdateSettings1(settings, input);
            if (input.defaultCount)
                settings.paging.itemsPerPage = input.defaultCount;
        }

        Config.Message = settings;
    }

    function CheckRouteMessage() {
        if (Routing.route == 'messages') {
            self.BaseLoad.Login(false, false, false, function (data) {
                if (!data.err) {
                    self.BaseLoad.Tmpl(settings.tmpl, function () {
                        UpdateMenu();
                        UpdateContent();
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
    }

    function UpdateContent() {
        self.WidgetLoader(false);
        var params = Routing.params;
        if (!params.block)
            params.block = 'topic'

        if (params.block == 'topic') {
            FillTopic();
            self.currentPage = Routing.GetCurrentPage();
        }
        else if (params.block == 'list' && params.id)
            FillList(params.id);
    }

    function UpdateMenu() {
        self.BaseLoad.Script(PokupoWidgets.model.menu, function () {
            self.DispatchEvent('w.onload.menu', {menu: {}, active: ''});
        });
    }

    function RegisterEvents() {
        self.AddEvent('w.change.route', function () {
            CheckRouteMessage();
        });

        self.AddEvent('Message.check.login', function (form) {
            self.BaseLoad.UniqueUser('?username=' + encodeURIComponent(form.dstUser()), function (request) {
                if (request.check_username != 'on' && request.check_username != 'off')
                    form.dstUserError(settings.error.username.notFound);
                else
                    form.dstUserError('');
            })
        });

        self.AddEvent('Message.search', function (text) {
            FillTopic(text);
        });

        self.AddEvent('Message.add', function (topic) {
            var form = topic.modalForm();

            self.BaseLoad.UniqueUser('?username=' + encodeURIComponent(form.dstUser()), function (request) {
                if (request.check_username != 'on' && request.check_username != 'off') {
                    form.dstUserError(settings.error.username.notFound);
                }
                else {
                    form.dstUserError('');
                    self.BaseLoad.MessageAdd($('form#' + form.cssFormMessage), function (data) {
                        if (!data.err) {
                            FillTopic()
                        }
                        else {
                            self.QueryError(data, function () {
                                self.DispatchEvent('Message.add', topic)
                            });
                        }
                    });
                }
            })
        });

        self.AddEvent('Message.read.topic', function (topicArray) {
            for (var i = 0; i <= topicArray.length - 1; i++) {
                self.BaseLoad.TopicRead(topicArray[i].idTopic(), function (data) {
                    if (data.result != 'ok') {
                        self.QueryError(data, function () {
                            self.DispatchEvent('Message.read.topic', topicArray)
                        });
                    }
                    else
                        self.DispatchEvent('w.change.count.mess');
                });
            }
        });

        self.AddEvent('Message.delete.topic', function (topicArray) {
            for (var i = 0; i <= topicArray.length - 1; i++) {
                self.BaseLoad.TopicDelete(topicArray[i].idTopic(), function (data) {
                    if (data.result != 'ok') {
                        self.ShowMessage(settings.message.error, function () {
                            Routing.SetHash('messages', 'Сообщения', {});
                        }, false);
                    }
                    else
                        self.DispatchEvent('w.change.count.mess');
                });
            }
        });

        self.AddEvent('Message.delete.oneTopic', function (topicId) {
            self.Confirm(settings.message.confirmDeleteTopic, function () {
                self.BaseLoad.TopicDelete(topicId, function (data) {
                    if (data.result != 'ok') {
                        self.ShowMessage(settings.message.error, function () {
                        }, false);
                    }
                    else {
                        self.DispatchEvent('w.change.count.mess');
                        Routing.SetHash('messages', 'Сообщения', {});
                    }
                });
            });
        });

        self.AddEvent('Message.read.message', function (message, topic) {
            self.BaseLoad.MessageSetRead(message.id(), function (data) {
                if (data.result != 'ok') {
                    self.ShowMessage(settings.message.error, function () {
                        Routing.SetHash('messages', topic.nameTopic(), {block: 'list', id: topic.topicId()});
                    }, false);
                }
                else
                    self.DispatchEvent('w.change.count.mess');
            });
        });

        self.AddEvent('Message.unread.message', function (message, topic) {
            self.BaseLoad.MessageSetUnread(message.id(), function (data) {
                if (data.result != 'ok') {
                    self.ShowMessage(settings.message.error, function () {
                        Routing.SetHash('messages', topic.nameTopic(), {block: 'list', id: topic.topicId()});
                    }, false);
                }
                else
                    self.DispatchEvent('w.change.count.mess');
            });
        });

        self.AddEvent('Message.reply', function (form) {
            self.BaseLoad.MessageAdd($('form#' + form.cssFormMessage), function (data) {

                if (!data.err) {
                    var newMessage = new MessageViewModel(data, form.topic, settings);
                    form.topic.messages.push(newMessage);
                    newMessage.ClickExpand();
                    form.ClickCancel();
                }
                else {
                    self.QueryError(
                        data,
                        function () {
                            self.DispatchEvent('Message.reply', form)
                        },
                        function () {
                            form.ClearForm()
                        });
                }
            });
        });

        self.AddEvent('Message.empty', function () {
            FillTopic();
        })
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings);
    }

    function InsertContainerTopic() {
        self.InsertContainer(settings, 'topic');
    }

    function InsertContainerList() {
        self.InsertContainer(settings, 'list');
    }

    function InsertContainerEmptyList() {
        self.InsertContainer(settings, 'empty');
    }

    function FillTopic(text) {
        var start = (Routing.GetCurrentPage() - 1) * settings.paging.itemsPerPage;
        var query = start + '/' + settings.paging.itemsPerPage;
        if (text)
            query = query + '/' + encodeURIComponent(text);
        self.BaseLoad.TopicList(query, function (data) {
            TopicMessageViewModel.prototype = new Widget();
            var content = new TopicMessageViewModel(self, settings);
            if (!data.err) {
                content.AddContent(data);
                if (text)
                    content.searchMessage(text);

                InsertContainerTopic();
                RenderTopic(content);
            }
            else {
                var msg = settings.message.noResult;
                if (data.msg)
                    msg = data.msg;
                content.SetErrorMessage(msg);
                if (text)
                    content.searchMessage(text);

                InsertContainerEmptyList();
                RenderEmptyList(content);
            }
        });
    }

    function FillList(id) {
        var fullInfo = 'unread';
        if (Routing.params.info)
            fullInfo = Routing.params.info;
        self.BaseLoad.TopicInfo(id, fullInfo, function (data) {
            var content = new ListMessageViewModel(settings);
            content.AddContent(data);

            InsertContainerList();
            RenderList(content);
        });
    }

    function RenderTopic(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerTopic();
                RenderTopic(data);
            },
            function(){
                InsertContainerEmptyWidget();
            },
            'topic'
        );
    }

    function RenderList(data) {
        self.RenderTemplate(data, settings,
            function(){
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
            },
            function(data){
                InsertContainerList();
                RenderList(data);
            },
            function(){
                InsertContainerEmptyWidget();
            },
            'list'
        );
    }

    function RenderEmptyList(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerEmptyList();
                RenderEmptyList(data);
            },
            function(){
                InsertContainerEmptyWidget();
            },
            'empty'
        );
    }
};

var TopicMessageViewModel = function (widget, settings) {
    var self = this;
    self.messageError = ko.observable();
    self.messages = ko.observableArray();
    self.paging = null;
    self.countAll = ko.observable();
    self.countNewMessage = ko.computed(function () {
        return Parameters.cache.message.countNewMessage();
    }, this);
    self.modalForm = ko.observable(new FormMessageViewModel(self, settings));
    self.cssSelectAll = "messagesSelectAll";
    self.isSelectedAll = ko.observable(false);
    self.isSelectedAll.subscribe(function (check) {
        ko.utils.arrayForEach(self.messages(), function (messages) {
            $('#' + messages.cssCheckboxMessage())[0].checked = check;
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
        DispatchEvent('Message.search', self.searchMessage());
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
        if (real.length > 0) {
            DispatchEvent('Message.read.topic', real);
        }
    };
    self.ClickDelete = function () {
        self.Confirm(settings.message.confirmDeleteSeveralTopic, function () {
            var selected = self.GetSelected();
            $.each(selected, function (i) {
                self.messages.remove(selected[i]);
            });
            EventDispatcher.DispatchEvent('Message.delete.topic', selected);
            if (self.messages().length == 0)
                DispatchEvent('Message.empty');
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
        return new TopicViewModel(data, self, settings);
    };
    self.AddPages = function () {
        var ClickLinkPage = function () {
            Loader.Indicator('Message', false);
            Routing.UpdateHash({page: this.pageId});
        };
        self.paging = Paging.GetPaging(self.countAll(), settings, ClickLinkPage);
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

    function DispatchEvent(event, data){
        EventDispatcher.DispatchEvent(event, data);
    }
};

var TopicViewModel = function (data, list, settings) {
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
    self.isSelected.subscribe(function (check) {
        var count = list.messages().length;
        var selected = [];

        for (var i = 0; i <= count - 1; i++) {
            if (list.messages()[i].isSelected())
                selected.push(list.messages()[i].id);
        }

        if (selected.length < count)
            $('#' + list.cssSelectAll)[0].checked = false;
        else
            $('#' + list.cssSelectAll)[0].checked = true;
        $('#' + self.cssCheckboxMessage())[0].checked = check;
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
        self.Confirm(settings.message.confirmDeleteSeveralTopic, function () {
            EventDispatcher.DispatchEvent('Message.delete.topic', [self]);
            list.messages.remove(self);
            if (list.messages().length == 0)
                EventDispatcher.DispatchEvent('Message.empty');
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

var FormMessageViewModel = function (topic, settings) {
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
        if (Validate()) {
            DispatchEvent('Message.add', topic);
        }
    };
    self.ClickCancel = function () {
        ClearForm();
    };
    self.OnBlurEvent = function () {
        DispatchEvent('Message.check.login', self);
    };
    function ClearForm() {
        self.dstUser('');
        self.dstUserError('');
        self.topicName('');
        self.topicNameError('');
        self.text('');
        self.textError('');
        self.copyMail('');
    }
    function Validate() {
        if (!self.dstUser())
            self.dstUserError(settings.error.username.empty);
        else
            self.dstUserError();

        if (!self.topicName())
            self.topicNameError(settings.error.topic.empty);
        else
            self.topicNameError('');

        if (!self.text())
            self.textError(settings.error.text.empty);
        else
            self.textError();

        if (self.dstUserError() || self.topicNameError() || self.textError())
            return false

        return true;
    }
    function DispatchEvent(event, data){
        EventDispatcher.DispatchEvent(event, data);
    }
};

var SimpleFormMessageViewModel = function (data, settings) {
    var self = this;
    self.text = ko.observable();
    self.textError = ko.observable();
    self.topic = data;
    self.copyMail = ko.observable(false);
    self.cssFormMessage = 'simple_form_message';

    self.ClickSend = function () {
        if (Validate()) {
            EventDispatcher.DispatchEvent('Message.reply', self);
        }
    };
    self.ClickCancel = function () {
        $('#' + self.cssFormMessage).hide(200);
        self.ClearForm();
    };
    self.ClearForm = function () {
        self.text('');
        self.textError('');
        self.copyMail(false);
    }
    function Validate() {
        if (!self.text())
            self.textError(settings.error.text.empty);
        else
            self.textError();

        if (self.textError())
            return false
        return true;
    }
};

var ListMessageViewModel = function (settings) {
    var self = this;
    self.topicId = ko.observable();
    self.nameTopic = ko.observable();
    self.messages = ko.observableArray();
    self.simpleForm = new SimpleFormMessageViewModel(self, settings);
    self.cssExpandAll = 'expand';
    self.cssCollapseAll = 'collapse';

    self.AddContent = function (data) {
        self.topicId(data.id_topic);
        self.nameTopic(data.name_topic);
        $.each(data.messages, function (i) {
            self.messages.push(new MessageViewModel(data.messages[i], self, settings));
        });
    };
    self.ClickBack = function () {
        Routing.SetHash('messages', 'Сообщения', {block: 'topic', page: Routing.GetLastPageNumber()});
    };
    self.ClickDelete = function () {
        EventDispatcher.DispatchEvent('Message.delete.oneTopic', self.topicId());
    };
    self.ClickExpand = function () {
        var newMessages = [];
        var expand = $('.' + self.cssExpandAll),
            collaps = $('.' + self.cssCollapseAll);
        if (expand)
            expand.hide();
        if (collaps)
            collaps.show();

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

var MessageViewModel = function (data, topic, settings) {
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
    self.timeout = data.text_message.length / 250 * settings.timer;
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
        var id = topic.simpleForm.cssFormMessage;
        $('#' + id).show(200);
        $('#' + id)[0].scrollIntoView(250);
    };
    self.ClickRead = function () {
        if (!self.IsMy()) {
            DispatchEvent('Message.read.message', self, topic);
            SetStatus('read');
        }
    };
    self.ClickUnread = function () {
        DispatchEvent('Message.unread.message', self, topic);
        SetStatus('send');
    };
    self.ClickExpand = function () {
        self.isExpand(true);
        $('.' + self.cssPrevieClear).hide();
        $('.' + self.cssFull).show();
        if (self.status() == 'send') {
            self.time = 0;
            self.stopTime = false;
            InitTimer();
        }
    };
    self.ClickCollapse = function () {
        self.isExpand(false);
        $('.' + self.cssPrevieClear).show();
        $('.' + self.cssFull).hide();
        self.stopTime = true;
    };
    function InitTimer() {
        setTimeout(function () {
            if (!self.stopTime) {
                self.time = self.time + 1;
                if (self.time >= self.timeout) {
                    self.ClickRead();
                    return true;
                }
                else
                    InitTimer();
            }
        }, 1000);

        return false;
    }
    function DispatchEvent(event, data){
        EventDispatcher.DispatchEvent(event, data);
    }
    function SetStatus(status) {
        self.status(status);
    }
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

