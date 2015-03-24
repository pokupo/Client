window.ButtonPaymentWidget = function () {
    var self = this;
    self.widgetName = 'ButtonPaymentWidget';
    self.version = 1.1;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        tmpl: {
            path: null,
            id: {
                content: null,
                skin: null
            }
        },
        animate: null,
        inputParameters: {},
        containerId: null,
        containerButton: null,
        title: null,
        skinFromMemory: false,
        uniq: null,
        source: null,
        sourceVal: null
    };
    self.InitWidget = function () {
        self.RegisterEvents();
        self.CheckRouteButtonPayment();
        self.Loader();
        self.LoadTmpl();
    };
    self.Loader = function () {
        Loader.InsertContainer(self.settings.containerButton);
    };
    self.SetParameters = function (data) {
        self.settings.containerId = Config.Containers.buttonPayment.widget;
        self.settings.tmpl = Config.ButtonPayment.tmpl;
        self.settings.title = Config.ButtonPayment.title;

        self.settings.containerButton = data.element;

        var input = {};
        if (Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.buttonPayment) {
            input = WParameters.buttonPayment;
        }
        if (!$.isEmptyObject(input)) {
            if (input.tmpl && input.tmpl.id && input.tmpl.id.skin) {
                self.settings.skinFromMemory = true;
            }
            if (input.title)
                self.settings.title = input.title;
            if(input.animate)
                self.settings.animate = input.animate;
        }
        self.settings.inputParameters = input;

        for (var key in data.options.params) {
            switch (key) {
                case 'tmpl':
                    if (data.options.params['tmpl']) {
                        if (data.options.params['tmpl'].path)
                            self.settings.tmpl.path = data.options.params['tmpl'].path;
                        if (data.options.params['tmpl'].id) {
                            for (var key in data.options.params['tmpl'].id) {
                                self.settings.tmpl.id[key] = data.options.params['tmpl'].id[key];
                            }
                        }
                    }
                    break;
                case 'title':
                    self.settings.title = data.options.params['title'];
                    break;
                case 'uniq':
                    self.settings.uniq = data.options.params['uniq'];
                    break;
                case 'orderId':
                    self.settings.source = 'order';
                    self.settings.sourceVal = data.options.params['orderId'];
                    break;
                case 'goodsId':
                    self.settings.source = 'goods';
                    self.settings.sourceVal = data.options.params['goodsId'];
                    break;
                case 'amount':
                    self.settings.source = 'amount';
                    self.settings.sourceVal = data.options.params['amount'];
                    break;
                default:
                    self.settings.inputParameters[key] = data.options.params[key];
            }
        }
    };
    self.CheckRouteButtonPayment = function () {
        if (Routing.route == 'payment') {
            self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                self.InsertContainer.Content();
                if (Routing.params.orderId)
                    self.GetData.Order(Routing.params.orderId);
                if (Routing.params.goodsId)
                    self.GetData.Goods(Routing.params.goodsId);
                if (Routing.params.amount)
                    self.GetData.Amount(Routing.params.amount);
            });
        }
        else
            self.WidgetLoader(true);
    };
    self.LoadTmpl = function () {
        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
            EventDispatcher.DispatchEvent('ButtonPayment.onload.tmpl_' + self.settings.uniq)
        });
    };
    self.RegisterEvents = function () {
        EventDispatcher.AddEventListener('ButtonPayment.onload.tmpl_' + self.settings.uniq, function (data) {
            self.InsertContainer.Button();
            self.Fill.Button();
        });

        EventDispatcher.AddEventListener('widget.change.route', function () {
            self.CheckRouteButtonPayment();
        });

        EventDispatcher.AddEventListener('ButtonPaymentWidget.form.submit', function (form) {
            self.InsertContainer.Content();
            var dataStr = [];
            $.each(form.inData(), function (i) {
                if (form.inData()[i].name() == 'MOBILE_PHONE')
                    dataStr.push(form.inData()[i].name() + '=' + encodeURIComponent(form.inData()[i].value().replace(/\s/g, '').replace(/-/g, '')));
                else
                    dataStr.push(form.inData()[i].name() + '=' + encodeURIComponent(form.inData()[i].value()));
            });
            var str = dataStr.join('&');

            if (Routing.params.orderId) {
                str = Routing.params.orderId + '?' + str;
                self.GetData.Order(str);
            }
            if (Routing.params.goodsId) {
                str = Routing.params.goodsId + '?' + str;
                self.GetData.Goods(str);
            }
            if (Routing.params.amount) {
                str = Routing.params.amount + '/' + Parameters.shopId + '?' + str;
                self.GetData.Amount(str);
            }
        });
    };
    self.GetData = {
        Order: function (id) {
            self.BaseLoad.InvoicesOrder(id, function (data) {
                self.Fill.Content(data);
            });
        },
        Goods: function (id) {
            self.BaseLoad.InvoicesGoods(id, function (data) {
                self.Fill.Content(data);
            });
        },
        Amount: function (sum) {
            self.BaseLoad.InvoicesAmount(sum + '/' + Parameters.shopId, function (data) {
                self.Fill.Content(data);
            });
        }
    };
    self.InsertContainer = {
        EmptyWidget: function (container) {
            var temp = $(container).find(self.SelectCustomContent().join(', ')).clone();
            $(container).empty().html(temp);
        },
        Button: function () {
            self.InsertContainer.EmptyWidget(self.settings.containerButton);
            $(self.settings.containerButton).html($('script#' + self.GetTmplName('skin')).html());
        },
        Content: function () {
            self.InsertContainer.EmptyWidget("#" + self.settings.containerId);
            $("#" + self.settings.containerId).html($('script#' + self.GetTmplName('content')).html()).hide();
        }
    };
    self.Fill = {
        Button: function () {
            var button = new ButtonPaymentViewModel(self.settings);
            self.Render.Button(button);
        },
        Content: function (data) {
            var content = new PaymentViewModel();
            content.AddContent(data);
            self.Render.Content(content);
        }
    };
    self.Render = {
        Button: function (data) {
            try {
                ko.cleanNode($(self.settings.containerButton).children()[0]);
                ko.applyBindings(data, $(self.settings.containerButton).children()[0]);
                if(typeof AnimateButtonPayment == 'function')
                    new AnimateButtonPayment();
                if(self.settings.animate)
                    self.settings.animate();
            }
            catch (e) {
                self.Exception('Ошибка шаблона [' + self.GetTmplName('skin') + ']', e);
                if (self.settings.tmpl.custom) {
                    delete self.settings.tmpl.custom;
                    self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                        self.InsertContainer.Button();
                        self.Render.Button(data);
                    });
                }
                else {
                    self.InsertContainer.EmptyWidget();
                    self.WidgetLoader(true);
                }
            }
        },
        Content: function (data) {
            if ($("#" + self.settings.containerId).length > 0) {
                try {
                    ko.cleanNode($("#" + self.settings.containerId)[0]);
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    $.each(data.inData(), function (i) {
                        if (data.inData()[i].mask()) {
                            $('#' + data.inData()[i].cssField()).mask(data.inData()[i].mask(), {placeholder: "_"});
                        }
                    });
                    $("#" + self.settings.containerId).show();
                    self.WidgetLoader(true);
                    if(typeof AnimateButtonPayment == 'function')
                        new AnimateButtonPayment();
                    if(self.settings.animate)
                        self.settings.animate();
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('skin') + ']', e);
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                            self.InsertContainer.Content()();
                            self.Render.Content(data);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true);
                    }
                }
            }
            else{
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId + ']');
                self.WidgetLoader(true);
            }
        }
    };
};

var ButtonPaymentViewModel = function (opt) {
    var self = this;
    self.title = opt.title;

    self.ClickPay = function () {
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 1];
        if (opt.source == 'order')
            Routing.SetHash('payment', 'Оплата заказа', {orderId: opt.sourceVal});
        if (opt.source == 'goods')
            Routing.SetHash('payment', 'Оплата заказа', {goodsId: opt.sourceVal});
        if (opt.source == 'amount')
            Routing.SetHash('payment', 'Оплата заказа', {amount: opt.sourceVal});
    };
};

var PaymentViewModel = function () {
    var self = this;
    self.instruction = ko.observable();
    self.cssInstruction = 'instructtion_print_block';

    self.outData = ko.observableArray();

    self.inData = ko.observableArray();
    self.isInData = ko.observable(false);
    self.cssInDataForm = 'in_data_block';

    self.payForm = {
        action: ko.observable(),
        method: ko.observable(),
        target: ko.observable('_self'),
        cssPayForm: 'payform_block',
        field: ko.observableArray()
    };
    self.isPayForm = ko.observable(false);

    self.urlInvoice = ko.observable();
    self.cssInvoice = 'invoice_print_block';

    self.Print = function (id) {
        var w = window.open();
        w.document.write($('#' + id).html());
        w.print();
        w.close();
    };
    self.ClickPrintInstruction = function () {
        self.Print(self.cssInstruction);
    };
    self.ClickPrintInvoice = function () {
        self.Print(self.cssInvoice);
    };
    self.Back = function () {
        var last = Parameters.cache.lastPage;
        if (last.route == 'payment' || !last.route)
            Routing.SetHash('default', 'Домашняя', {});
        else
            Routing.SetHash(last.route, last.title, last.data);
    };
    self.ClickPay = function () {
        $('#' + self.payForm.cssPayForm).submit();
    };
    self.ClickRefresh = function () {
        Routing.SetHash(Routing.route, Routing.title, Routing.params, true);
    };
    self.ClickSubmit = function () {
        if (self.ValidationFrom()) {
            EventDispatcher.DispatchEvent('ButtonPaymentWidget.form.submit', self);
        }
    };
    self.ValidationFrom = function () {
        var test = true;
        $.each(self.inData(), function (i) {
            if (!self.inData()[i].ValidateField()) {
                test = false;
                return false;
            }
        })
        return test;
    };
    self.AddContent = function (data) {
        self.instruction(null);
        if (data.hasOwnProperty('instruction'))
            self.instruction(data.instruction);
        self.outData = ko.observableArray();
        if (data.hasOwnProperty('out_data')) {
            $.each(data.out_data, function (i) {
                self.outData.push(data.out_data[i]);
            });
        }
        self.isPayForm(false);
        self.payForm = {
            action: ko.observable(),
            method: ko.observable(),
            target: ko.observable('_self'),
            cssPayForm: 'payform_block',
            field: ko.observableArray()
        };
        self.isPayForm(false);
        if (data.hasOwnProperty('pay_form')) {
            self.isPayForm(true);
            self.payForm.action(data.pay_form.action);
            self.payForm.method(data.pay_form.method);
            if (data.pay_form.hasOwnProperty('new_window') && data.pay_form.new_window == 'yes') {
                self.payForm.target('_blank');
            }
            $.each(data.pay_form.hidden_field, function (i) {
                self.payForm.field.push(data.pay_form.hidden_field[i]);
            });
        }
        self.isInData(false);
        self.inData = ko.observableArray();
        if (data.hasOwnProperty('in_data')) {
            self.isInData(true);
            $.each(data.in_data, function (i) {
                var field = new PaymentFieldViewModel();
                field.AddContent(data.in_data[i])
                self.inData.push(field);
            });
        }
        self.urlInvoice(null);
        if (data.hasOwnProperty('url_invoice')) {
            self.urlInvoice(data.url_invoice);
        }
    };
};

var PaymentFieldViewModel = function () {
    var self = this;
    self.label = ko.observable();
    self.help = ko.observable();
    self.error = ko.observable();
    self.name = ko.observable();
    self.value = ko.observable();
    self.required = ko.observable(false);
    self.typeField = ko.observable();
    self.listSelect = ko.observableArray();
    self.regExp = ko.observable();
    self.mask = ko.observable();
    self.maxlength = ko.observable();
    self.cssField = ko.observable();

    self.AddContent = function (data) {
        if (data.hasOwnProperty('label'))
            self.label(data.label);
        if (data.hasOwnProperty('help'))
            self.help(data.help);
        if (data.hasOwnProperty('error'))
            self.error(data.error);
        if (data.hasOwnProperty('name')) {
            self.name(data.name);
            self.cssField('field_' + data.name);
        }
        if (data.hasOwnProperty('value'))
            self.value(data.value);
        if (data.hasOwnProperty('required'))
            if (data.required == 'yes')
                self.required(true);
        if (data.hasOwnProperty('type_field'))
            self.typeField(data.type_field)
        if (data.hasOwnProperty('list_select')) {
            $.each(data.list_select, function (i) {
                self.listSelect.push(data.list_select[i]);
            })
        }
        if (data.hasOwnProperty('reg_exp'))
            self.regExp(data.reg_exp);
        if (data.hasOwnProperty('mask'))
            self.mask(data.mask);
        if (data.hasOwnProperty('maxlength'))
            self.maxlength(data.maxlength);
    };
    self.ValidateField = function () {
        if (self.required()) {
            if (!self.value()) {
                self.error(Config.ButtonPayment.Error.required);
                return false;
            }
        }
//        if(self.regExp()){
//            var reg = new RegExp(self.regExp(), 'gi');
//            if(! reg.test(self.value())){
//                self.error(Config.ButtonPayment.Error.regExp);
//                return false;
//            }
//        }
        if (self.maxlength()) {
            if (self.value().length > self.maxlength()) {
                self.error(Config.ButtonPayment.Error.maxlength.replace('%s%', self.maxlength()));
                return false;
            }
        }
        return true;
    };
}
