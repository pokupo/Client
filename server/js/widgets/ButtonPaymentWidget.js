window.ButtonPaymentWidget = function(){
    var self = this;
    self.widgetName = 'ButtonPaymentWidget';
    self.settings = {
        tmplPath : null,
        contentTmpl : null,
        inputParameters : {},
        containerId : null,
        containerButton : null,
        title : null,
        skin : null,
        skinFromMemory: false,
        uniq : null,
        source : null,
        sourceVal : null
    };
    self.InitWidget = function(){
        self.RegisterEvents();
        self.Loader();
    };
    self.Loader = function(){
        Loader.InsertContainer(self.settings.containerButton);
    };
    self.SetParameters = function(data){
        self.settings.containerId = Config.Containers.payment;
        self.settings.tmplPath = Config.ButtonPayment.tmpl.path;
        self.settings.contentTmpl = Config.ButtonPayment.tmpl.contentTmpl;
        self.settings.title = Config.ButtonPayment.title;
        self.settings.skin = Config.ButtonPayment.tmpl.skin;
        
        self.settings.containerButton = data.element;
        
        var input = {};
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.buttonPayment){
            input = WParameters.buttonPayment;
        }
        if(!$.isEmptyObject(input)){
            if(input.tmpl)
                self.settings.tmplPath = 'buttonPayment/' + input.tmpl + '.html';
            if(input.skin){
                self.settings.skin = input.skin;
                self.settings.skinFromMemory = true;
            }
            if(input.title)
                self.settings.title = input.title;
            if(input.container)
                self.settings.containerId = input.container;
        }
        self.settings.inputParameters = input;
        
        for(var key in data.options.params){
            switch (key){
                case 'tmpl':
                    self.settings.tmplPath = 'buttonPayment/' + data.options.params['tmpl'] + '.html';
                    break;
                case 'title':
                    self.settings.title = data.options.params['title'];
                    break;
                case 'skin':
                    self.settings.skin = data.options.params['skin'];
                    self.settings.skinFromMemory = true;
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
    self.CheckRouteButtonPayment = function(){
        if(Routing.route == 'payment'){
            self.WidgetLoader(false);
            self.InsertContainer.Content();
            if(Routing.params.orderId)
                self.GetData.Order(Routing.params.orderId);
            if(Routing.params.goodsId)
                self.GetData.Goods(Routing.params.goodsId);
            if(Routing.params.amount)
                self.GetData.Amount(Routing.params.amount);
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                EventDispatcher.DispatchEvent('ButtonPayment.onload.tmpl_' + self.settings.uniq)
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                    EventDispatcher.DispatchEvent('ButtonPayment.onload.tmpl_' + self.settings.uniq)
                });
            });
        }
        
        EventDispatcher.AddEventListener('ButtonPayment.onload.tmpl_' + self.settings.uniq, function (data){
            self.InsertContainer.Button();
            self.Fill.Button();
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (){
            self.CheckRouteButtonPayment();
        });
    };
    self.GetData = {
        Order : function(id){
            self.BaseLoad.InvoicesOrder(id, function(data){
                self.Fill.Content(data);
            });
        },
        Goods : function(id){
            self.BaseLoad.InvoicesGoods(id, function(data){
                self.Fill.Content(data);
            });
        },
        Amount : function(sum){
            self.BaseLoad.InvoicesAmount(sum, function(data){
                self.Fill.Content(data);
            });
        }
    };
    self.InsertContainer = {
        Button : function(){
            $(self.settings.containerButton).empty().append($('script#' + self.settings.skin).html());
        },
        Content : function(){
            $("#" + self.settings.containerId).empty().append($('script#' + self.settings.contentTmpl).html());
        }
    };
    self.Fill = {
        Button : function(){
            var button = new ButtonPaymentViewModel(self.settings);
            self.Render.Button(button);
        },
        Content : function(data){
            var content = new PaymentViewModel();
            content.AddContent(data);
            self.Render.Content(content);
        }
    };
    self.Render = {
        Button : function(data){
            ko.applyBindings(data, $(self.settings.containerButton).children()[0]);
        },
        Content : function(data){
            if ($("#" + self.settings.containerId).length > 0) {
                ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
            }
            self.WidgetLoader(true);
        }
    };
};

var ButtonPaymentViewModel = function(opt){
    var self = this;
    self.title = opt.title;
    
    self.ClickPay = function(){
        if(opt.source == 'order')
            Routing.SetHash('payment', 'Оплата заказа', { orderId: opt.sourceVal});
        if(opt.source == 'goods')
            Routing.SetHash('payment', 'Оплата заказа', { goodsId: opt.sourceVal});
        if(opt.source == 'amount')
            Routing.SetHash('payment', 'Оплата заказа', { amount: opt.sourceVal});
    };
};

var PaymentViewModel = function(){
    var self = this;
    self.instruction = ko.observable();
    self.cssInstruction = 'instructtion_print_block';
    
    self.outData = ko.observableArray();
    
    self.inData = ko.observableArray();
    self.isInData = ko.observable(false);
    
    self.payForm = {
        action : ko.observable(),
        method : ko.observable(),
        target : ko.observable('_self'),
        cssPayForm : 'payform_block',
        field : ko.observableArray()
    };
    self.isPayForm = ko.observable(false);
    
    self.urlInvoice = ko.observable();
    self.cssInvoice = 'invoice_print_block';
    
    self.Print = function(id){
        var w = window.open();
        w.document.write($('#' + id).html());
        w.print();
        w.close();
    };
    self.ClickPrintInstruction = function(){
        self.Print(self.cssInstruction);
    };
    self.ClickPrintInvoice = function(){
        self.Print(self.cssInvoice);
    };
    self.Back = function(){
        var t = Parameters.cache.history;
        for(var i = 0; i <= t.length-1; i++){
            var link = t.pop();
            if(link.route != 'payment'){ 
                Routing.SetHash(link.route, link.title, link.data, true);
                return false;
            }
        }
    };
    self.ClickPay = function(){
        $('#' + self.payForm.cssPayForm).submit();
    };
    self.ClickRefresh = function(){
        Routing.SetHash(Routing.route, Routing.title, Routing.params, true);
    };
    self.AddContent = function(data){
        if (data.hasOwnProperty('instruction'))
            self.instruction(data.instruction);
        if (data.hasOwnProperty('out_data')){
            $.each(data.out_data, function(i){
                self.outData.push(data.out_data[i]);
            });
        }
        if(data.hasOwnProperty('pay_form')){
            self.isPayForm(true);
            self.payForm.action(data.pay_form.action);
            self.payForm.method(data.pay_form.method);
            if(data.pay_form.hasOwnProperty('new_window') && data.pay_form.new_window == 'yes'){
                self.payForm.target('_blank');
            }
            $.each(data.pay_form.hidden_field, function(i){
                self.payForm.field.push(data.pay_form.hidden_field[i]);
            });
        }
        if(data.hasOwnProperty('in_data')){
            self.isInData(true);
            $.each(data.out_data, function(i){
                self.inData.push(data.out_data[i]);
            });
        }
        if(data.hasOwnProperty('url_invoice')){
            self.urlInvoice(data.url_invoice);
        }
    };
};
