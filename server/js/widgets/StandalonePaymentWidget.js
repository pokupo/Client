var StandalonePaymentWidget = function () {
    var self = this;
    self.widgetName = 'StandalonePaymentWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        containerId : {
            button: '',
            content: ''
        },
        customContainer: null,
        tmpl :{
            path : null,
            id : {
                button : null,
                paymentList: null,
                content : null
            }
        },
        animate: null,
        inputParameters: {},
        containerButton: null,
        title: null,
        uniq: null,
        source: null,
        sourceVal: null
    };
    self.idGoods = null;
    self.count = 1;
    self.idShop = null;
    self.amount = null;
    self.uid = null;
    self.idShopPartner = null;
    self.mailUser = null;
    self.idMethodPayment = null;

    self.InitWidget = function () {
        self.settings.containerId = Config.Containers.standalonePayment;
        self.settings.tmpl = Config.StandalonePayment.tmpl;
        self.settings.title = Config.StandalonePayment.title;

        self.SetParameters();
       // self.RegisterEvents();
        self.CheckRouteStandalonePayment();
    };
    self.SetParameters = function (data) {
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/StandalonePaymentWidget/);
            if(temp.standalonePayment){
                input = temp.standalonePayment;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.standalonePayment){
            input = WParameters.standalonePayment;
        }

        if(JSSettings.dev)
            Logger.Console.VarDump(self.widgetName, "Input parameters", input);

        if(!$.isEmptyObject(input)){
            if (input.title)
                self.settings.title = input.title;

            if (input.idGoods)
                self.settings.idGoods = input.idGoods;
            if (input.count )
                self.settings.count  = input.count;

            if (input.idShop )
                self.settings.idShop  = input.idShop;
            if (input.amount)
                self.settings.amount  = input.amount;
            if (input.uid)
                self.settings.uid  = input.uid;

            if(input.idShopPartner)
                self.settings.idShopPartner = input.idShopPartner;
            if (input.mailUser)
                self.settings.mailUser = input.mailUser;
            if (input.idMethodPayment)
                self.settings.idMethodPayment = input.idMethodPayment;

            if(input.tmpl){
                if(input.tmpl.path)
                    self.settings.tmpl.path = input.tmpl.path;
                if(input.tmpl.id){
                    for(var key in input.tmpl.id){
                        self.settings.tmpl.id[key] = input.tmpl.id[key];
                    }
                }
            }
            if(input.container){
                if(input.container){
                    for(var key in input.container){
                        self.settings.containerId[key] = input.container[key];
                    }
                }
            }
        }
        self.settings.inputParameters = input;
        if(JSSettings.dev)
            Logger.Console.VarDump(self.widgetName, "Result settings", self.settings);
    };
    self.CheckRouteStandalonePayment = function () {
        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
            if (Routing.route == 'standalone_payment') {
                if (self.settings.idGoods != null && self.settings.idShopPartner == null)
                    self.GetData.Goods();
                if (self.settings.idGoods != null && self.settings.idShopPartner != null)
                    self.GetData.PartnerGoods();
                if (self.settings.idShop != null)
                    self.GetData.Service();
            }
            else{
                self.InsertContainer.Button();
                self.Fill.Button();
            }
        });
    };
    self.RegisterEvents = function () {
        EventDispatcher.AddEventListener('widget.change.route', function () {
            self.CheckRouteButtonPayment();
        });

        EventDispatcher.AddEventListener('StandalonePaymentWidget.form.submit', function (form) {
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
        Goods: function () {
            var str = self.settings.idGoods + '/';
            if(self.settings.count)
                str = str + self.settings.count + '/';
            var parameters = [];
            if(self.settings.mailUser)
                parameters.push('mailUser=' + self.settings.mailUser);
            if(self.settings.idMethodPayment)
                parameters.push('idMethodPayment=' + self.settings.idMethodPayment);
            if(parameters.length > 0)
                str = str + '?' + parameters.join('&');
            self.BaseLoad.InvoicesGoods(str, function (data) {
                self.Fill.PaymentList(data);
            });
        },
        PartnerGoods: function(){
            var str = self.settings.idGoods + '/';
            if(self.settings.count)
                str = str + self.settings.count + '/';
            if(self.settings.idShopPartner)
                str = str + self.settings.idShopPartner + '/';
            var parameters = [];
            if(self.settings.mailUser)
                parameters.push('mailUser=' + self.settings.mailUser);
            if(self.settings.idMethodPayment)
                parameters.push('idMethodPayment=' + self.settings.idMethodPayment);
            if(parameters.length > 0)
                str = str + '?' + parameters.join('&');
            self.BaseLoad.InvoicesPartnerGoods(str, function (data) {
                self.Fill.PaymentList(data);
            });
        },
        Service: function () {
            var str = self.settings.idShop + '/';
            if(self.settings.idShopPartner)
                str = str + self.settings.idShopPartner;

            var parameters = [];
            if(self.settings.amount)
                parameters.push('amount=' + self.settings.amount);
            if(self.settings.uid)
                parameters.push('uid=' + self.settings.uid);
            if(self.settings.mailUser)
                parameters.push('mailUser=' + self.settings.mailUser);
            if(self.settings.idMethodPayment)
                parameters.push('idMethodPayment=' + self.settings.idMethodPayment);
            if(parameters.length > 0)
                str = str + '?' + parameters.join('&');

            self.BaseLoad.InvoicesService(str, function (data) {
                self.Fill.PaymentList(data);
            });
        }
    };
    self.InsertContainer = {
        EmptyWidget: function (container) {
            var temp = $(container).find(self.SelectCustomContent().join(', ')).clone();
            $(container).empty().html(temp);
        },
        Button: function () {
            self.InsertContainer.EmptyWidget("#" + self.settings.containerId.button.widget);
            $("#" + self.settings.containerId.button.widget).html($('script#' + self.GetTmplName('button')).html());
        },
        PaymentList: function () {
            console.log(self.GetTmplName('paymentList'));
            self.InsertContainer.EmptyWidget("#" + self.settings.containerId.content.widget);
            $("#" + self.settings.containerId.content.widget).html($('script#' + self.GetTmplName('paymentList')).html());
        },
        Content: function () {
            self.InsertContainer.EmptyWidget("#" + self.settings.containerId.content.widget);
            $("#" + self.settings.containerId.content.widget).html($('script#' + self.GetTmplName('content')).html()).hide();
        }
    };
    self.Fill = {
        Button: function () {
            var button = new StandaloneButtonPaymentViewModel(self.settings);
            self.Render.Button(button);
        },
        PaymentList: function(data){
            console.log(self.settings.idMethodPayment);
            if(!self.settings.idMethodPayment) {
                console.log('test');
                var list = new StandalonePaymentListViewModel();
                if (data) {
                    $.each(data, function (i) {
                        list.payments.push(new StandalonePaymentItemViewModel(data[i]));
                    });
                }

                self.InsertContainer.PaymentList();
                self.Render.PaymentList(list);
            }
            else{
                self.InsertContainer.Content();
            }
        },
        Content: function (data) {
            var content = new StandalonePaymentViewModel();
            content.AddContent(data);
            self.Render.Content(content);
        }
    };
    self.Render = {
        Button: function (data) {
            try {
                ko.cleanNode($('#' + self.settings.containerId.button.widget).children()[0]);
                ko.applyBindings(data, $('#' + self.settings.containerId.button.widget).children()[0]);
                if (typeof AnimateStandalonePayment == 'function')
                    new AnimateStandalonePayment();
                if (self.settings.animate)
                    self.settings.animate();
            }
            catch (e) {
                self.Exception('Ошибка шаблона [' + self.GetTmplName('button') + ']', e);
                if (self.settings.tmpl.custom) {
                    delete self.settings.tmpl.custom;
                    self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                        self.InsertContainer.Button()();
                        self.Render.Button(data);
                    });
                }
                else {
                    self.InsertContainer.EmptyWidget('#' + self.settings.containerId.button.widget);
                    self.WidgetLoader(true, self.settings.containerId.button.widget);
                }
            }
        },
        PaymentList: function (data) {
            if ($("#" + self.settings.containerId.content.widget).length > 0) {
                //try {
                    ko.cleanNode($("#" + self.settings.containerId.content.widget)[0]);
                    ko.applyBindings(data, $("#" + self.settings.containerId.content.widget)[0]);
                    $("#" + self.settings.containerId.content.widget).show();
                    self.WidgetLoader(true);
                    if (typeof AnimateButtonPayment == 'function')
                        new AnimateButtonPayment();
                    if (self.settings.animate)
                        self.settings.animate();
                //}
                //catch (e) {
                //    self.Exception('Ошибка шаблона [' + self.GetTmplName('paymentList') + ']', e);
                //    if (self.settings.tmpl.custom) {
                //        delete self.settings.tmpl.custom;
                //        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                //            self.InsertContainer.PaymentList()();
                //            self.Render.PaymentList(data);
                //        });
                //    }
                //    else {
                //        self.InsertContainer.EmptyWidget("#" + self.settings.containerId.content.widget);
                //        self.WidgetLoader(true, self.settings.containerId.content.widget);
                //    }
                //}
            }
            else {
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId.content.widget + ']');
                self.WidgetLoader(true);
            }
        },
        Content: function (data) {
            if ($("#" + self.settings.containerId.content.widget).length > 0) {
                try {
                    ko.cleanNode($("#" + self.settings.containerId.content.widget)[0]);
                    ko.applyBindings(data, $("#" + self.settings.containerId.content.widget)[0]);
                    $.each(data.inData(), function (i) {
                        if (data.inData()[i].mask()) {
                            $('#' + data.inData()[i].cssField()).mask(data.inData()[i].mask(), {placeholder: "_"});
                        }
                    });
                    $("#" + self.settings.containerId.content.widget).show();
                    self.WidgetLoader(true);
                    if (typeof AnimateButtonPayment == 'function')
                        new AnimateButtonPayment();
                    if (self.settings.animate)
                        self.settings.animate();
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('content') + ']', e);
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                            self.InsertContainer.Content()();
                            self.Render.Content(data);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget("#" + self.settings.containerId.content.widget);
                        self.WidgetLoader(true, self.settings.containerId.content.widget);
                    }
                }
            }
            else {
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId.content.widget + ']');
                self.WidgetLoader(true);
            }
        }
    };
};

var StandaloneButtonPaymentViewModel = function (opt) {
    var self = this;
    self.title = opt.title;

    self.ClickPay = function () {
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 1];
        Routing.SetHash('standalone_payment', 'Оплата товара', {});
    };
};

var StandalonePaymentListViewModel = function(){
    var self = this;
    self.payments = ko.observableArray();

}

var StandalonePaymentItemViewModel = function(obj){
    var self = this;
    self.id = obj.id;
    self.namePayment = obj.name_payment;
    self.costPayment = obj.cost_payment;
    self.descPayment = obj.desc_payment;
    self.instrPayment = obj.instr_payment;
    self.logoPayment = obj.logo_payment;
    self.timePayment = obj.time_payment;

    self.Click = {

    }
}

var StandalonePaymentViewModel = function () {
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
            EventDispatcher.DispatchEvent('StandalonePaymentWidget.form.submit', self);
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
                var field = new StandalonePaymentFieldViewModel();
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

var StandalonePaymentFieldViewModel = function () {
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

var TestStandalonePayment = {
    Init : function(){
        if(typeof Widget == 'function'){
            StandalonePaymentWidget.prototype = new Widget();
            var payment = new StandalonePaymentWidget();
            payment.Init(payment);
        }
        else{
            setTimeout(function(){TestStandalonePayment.Init()}, 100);
        }
    }
}

TestStandalonePayment.Init();
