window.ButtonPaymentWidget = function () {
    var self = this;
    self.widgetName = 'ButtonPaymentWidget';
    self.version = 1.1;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container:  {widget: 'content', def: 'defaultPaymentWidgetId'},
        containerButton: null,
        tmpl : {
            path : 'buttonPaymentTmpl.html', // файл шаблонов
            id : {
                content : 'paymentPageTmpl', //id шаблона страницы оплаты
                skin : 'buttonPaymentImpl' //id шаблона кнопки
            }
        },
        Error : {
            required : 'Поле обязательно для заполнения.',
            regExp : 'Недопустимое значение.',
            maxlength : 'Максимум %s% символов.'
        },
        animate: typeof AnimateButtonPayment == 'function' ? AnimateButtonPayment : null,
        title : "Оплатить", // заголовок кнопки
        skinFromMemory: false,
        uniq: null,
        source: null,
        sourceVal: null
    };
    function InitWidget() {
        SetInputParameters();
        RegisterEvents();
        CheckRouteButtonPayment();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters('buttonPayment');

        if(!$.isEmptyObject(input))
            settings = self.UpdateSettings1(settings, input);

        Config.Containers.buttonPayment = settings.container;
    }

    self.SetParameters = function (data) {
        settings.containerButton = data.element;

        var input = self.GetInputParameters('buttonPayment');

        if (!$.isEmptyObject(input)) {
            if (input.tmpl && input.tmpl.id && input.tmpl.id.skin)
                settings.skinFromMemory = true;
            settings = self.UpdateSettings1(settings, input);
        }

        var options = data.options.params;
        for (var key in options) {
            switch (key) {
                case 'tmpl':
                    if (options['tmpl']) {
                        if (options['tmpl'].path)
                            settings.tmpl.path = options['tmpl'].path;
                        if (options['tmpl'].id) {
                            for (var key in options['tmpl'].id) {
                                settings.tmpl.id[key] = options['tmpl'].id[key];
                            }
                        }
                    }
                    break;
                case 'title':
                    settings.title = options['title'];
                    break;
                case 'uniq':
                    settings.uniq = options['uniq'];
                    break;
                case 'orderId':
                    settings.source = 'order';
                    settings.sourceVal = options['orderId'];
                    break;
                case 'goodsId':
                    settings.source = 'goods';
                    settings.sourceVal = options['goodsId'];
                    break;
                case 'amount':
                    settings.source = 'amount';
                    settings.sourceVal = options['amount'];
                    break;
            }
        }
        Config.ButtonPayment = settings;
    };
    function CheckRouteButtonPayment() {
        if (Routing.route == 'payment') {
            self.BaseLoad.Tmpl(settings.tmpl, function () {
                InsertContainerContent();
                var params = Routing.params;
                if (params.orderId)
                    GetDataOrder(params.orderId);
                if (params.goodsId)
                    GetDataGoods(params.goodsId);
                if (params.amount)
                    GetDataAmount(params.amount);
            });
        }
        else
            self.WidgetLoader(true);
    }

    function RegisterEvents() {
        self.AddEvent('BPayment.tmpl_' + settings.uniq, function (data) {
            InsertContainerButton();
            FillButton();
        });

        self.AddEvent('w.change.route', function () {
            CheckRouteButtonPayment();
        });

        self.AddEvent('w.ready', function () {
            if (settings.containerButton != null) {
                Loader.InsertContainer(settings.containerButton);
                self.BaseLoad.Tmpl(settings.tmpl, function () {
                    self.DispatchEvent('BPayment.tmpl_' + settings.uniq)
                });
            }
        });

        self.AddEvent('BPayment.submit', function (form) {
            InsertContainerContent();
            var dataStr = [];
            $.each(form.inData(), function (i) {
                if (form.inData()[i].name() == 'MOBILE_PHONE')
                    dataStr.push(form.inData()[i].name() + '=' + encodeURIComponent(form.inData()[i].value().replace(/\s/g, '').replace(/-/g, '')));
                else
                    dataStr.push(form.inData()[i].name() + '=' + encodeURIComponent(form.inData()[i].value()));
            });
            var str = dataStr.join('&');

            var p = Routing.params;
            if (p.orderId) {
                str = p.orderId + '?' + str;
                GetDataOrder(str);
            }
            if (p.goodsId) {
                str = p.goodsId + '?' + str;
                GetDataGoods(str);
            }
            if (p.amount) {
                str = p.amount + '/' + Parameters.shopId + '?' + str;
                GetDataAmount(str);
            }
        });
    }

    function GetDataOrder(id) {
        self.BaseLoad.InvoicesOrder(id, function (data) {
            if (self.QueryError(data, function () {
                    GetDataOrder(id)
                }, function () {
                    Routing.SetHash('default', 'Домашняя', {});
                })) {
                FillContent(data);
            }
        });
    }

    function GetDataGoods(id) {
        self.BaseLoad.InvoicesGoods(id, function (data) {
            FillContent(data);
        });
    }

    function GetDataAmount(sum) {
        self.BaseLoad.InvoicesAmount(sum + '/' + Parameters.shopId, function (data) {
            FillContent(data);
        });
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings)
    }

    function InsertContainerButton() {
        $(settings.containerButton).html($('script#' + self.GetTmplName1(settings, 'skin')).html());
    }

    function InsertContainerContent() {
        self.InsertContainer(settings, 'content');
    }

    function FillButton() {
        var button = new ButtonPaymentViewModel(settings);
        RenderButton(button);
    }

    function FillContent(data) {
        var content = new PaymentViewModel(settings);

        var str = [];
        var fields = data.pay_form.hidden_field;
        $.each(fields, function (i) {
            str.push(fields[i].name + '=' + encodeURIComponent(fields[i].value));
        });
        if (str)
            $.cookie(Config.Base.cookie.orderId, str.join('&'));

        content.AddContent(data);
        RenderContent(content);
    }

    function RenderButton(data) {
        var container = $(settings.containerButton);
        try {
            ko.cleanNode(container.children()[0]);
            ko.applyBindings(data, container.children()[0]);
            if (settings.animate)
                settings.animate();
        }
        catch (e) {
            self.Exception('Ошибка шаблона [' + self.GetTmplName1(settings, 'skin') + ']', e);
            if (settings.tmpl.custom) {
                delete settings.tmpl.custom;
                self.BaseLoad.Tmpl(settings.tmpl, function () {
                    InsertContainerButton();
                    RenderButton(data);
                });
            }
            else {
                container.html('');
                self.WidgetLoader(true);
            }
        }
    }

    function RenderContent(data) {
        self.RenderTemplate(data, settings,
            function(data){
                $.each(data.inData(), function (i) {
                    if (data.inData()[i].mask()) {
                        $('#' + data.inData()[i].cssField()).mask(data.inData()[i].mask(), {placeholder: "_"});
                    }
                });
            },
            function(data){
                InsertContainerContent();
                RenderContent(data);
            },
            function(){
                InsertContainerEmptyWidget();
            },
            'content'
        );
    }
};

var ButtonPaymentViewModel = function (opt) {
    var self = this,
        alias = 'payment',
        title = 'Оплата заказа';
    self.title = opt.title;

    self.ClickPay = function () {
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 1];
        if (opt.source == 'order')
            SetHash({orderId: opt.sourceVal});
        if (opt.source == 'goods')
            SetHash({goodsId: opt.sourceVal});
        if (opt.source == 'amount')
            SetHash({amount: opt.sourceVal});
    };

    function SetHash(params){
        Routing.SetHash(alias, title, params);
    }
};

var PaymentViewModel = function (opt) {
    var self = this;
    self.title = opt.title;
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
            Routing.SetHash('purchases', 'Заказ № ' + Routing.params.orderId, {block: 'detail', id: 697});
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
        if (ValidationFrom()) {
            EventDispatcher.DispatchEvent('BPayment.submit', self);
        }
    };
    function ValidationFrom() {
        var test = true;
        $.each(self.inData(), function (i) {
            if (!self.inData()[i].ValidateField()) {
                test = false;
                return false;
            }
        })
        return test;
    }
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
                var params = data.pay_form.hidden_field[i];
                if (!data.pay_form.hidden_field[i].hasOwnProperty('value'))
                    params.value = '';
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

var TestButtonPayment = {
    Init: function () {
        if (typeof Widget == 'function') {
            window.ButtonPaymentWidget.prototype = new Widget();
            var buttonPayment = new window.ButtonPaymentWidget();
            buttonPayment.settings.uniq = EventDispatcher.GetUUID();
            buttonPayment.Init(buttonPayment);
        }
        else {
            setTimeout(function () {
                TestButtonPayment.Init()
            }, 100);
        }
    }
};

TestButtonPayment.Init();