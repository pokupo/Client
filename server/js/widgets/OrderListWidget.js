var OrderListWidget = function() {
    var self = this;
    self.widgetName = 'OrderListWidget';
    self.currentPage = 1;
    self.settings = {
        containerFormId: null,
        tmplPath: null,
        ordListTmplId: null,
        ordEmptyListTmplId: null,
        ordDetailTmplId: null,
        inputParameters: {},
        style: null
    };
    self.InitWidget = function() {
        self.settings.containerFormId = Config.Containers.orderList;
        self.settings.tmplPath = Config.OrderList.tmpl.path;
        self.settings.ordListTmplId = Config.OrderList.tmpl.ordListTmplId;
        self.settings.ordEmptyListTmplId = Config.OrderList.tmpl.ordEmptyListTmplId;
        self.settings.ordDetailTmplId = Config.OrderList.tmpl.ordDetailTmplId;
        self.settings.style = Config.OrderList.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.SetPosition();
    };
    self.SetInputParameters = function() {
        var input = {};
        if (Config.Base.sourceParameters == 'string') {
            var temp = JSCore.ParserInputParameters(/OrderListWidget.js/);
            if (temp.order) {
                input = temp.order;
            }
        }
        if (Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.order) {
            input = WParameters.order;
        }

        if (!$.isEmptyObject(input)) {
            if (input.tmpl)
                self.settings.tmplPath = 'orderList/' + input.tmpl + '.html';
        }
        self.settings.inputParameters = input;
    };
    self.CheckRouteOrder = function() {
        if (Routing.route == 'purchases') {
            self.BaseLoad.Login(false, false, false, function(data){
                if(!data.err){
                    self.Update.Menu();
                    self.Update.Content();
                }
                else{
                    Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
                    Routing.SetHash('login', 'Авторизация пользователя', {});
                    self.WidgetLoader(true);
                }  
            });
        }
        else
            self.WidgetLoader(true);
    };
    self.RegisterEvents = function() {
        if (JSLoader.loaded) {
            self.BaseLoad.Tmpl(self.settings.tmplPath, function() {
                self.CheckRouteOrder();
            });
        }
        else {
            EventDispatcher.AddEventListener('onload.scripts', function(data) {
                self.BaseLoad.Tmpl(self.settings.tmplPath, function() {
                    self.CheckRouteOrder();
                });
            });
        }

        EventDispatcher.AddEventListener('widget.change.route', function() {
            self.CheckRouteOrder();
        })
    };
    self.Update = {
        Content : function(){
            self.WidgetLoader(false);
            if(Routing.params.block == 'list'){
                self.Fill.List();
                self.currentPage = Routing.GetCurrentPage();
            }
            else if(Routing.params.block == 'detail' && Routing.params.orderId)
                self.Fill.Detail(Routing.params.orderId);
        },
        Menu : function(){
            Loader.Indicator('MenuPersonalCabinetWidget', false);
            self.BaseLoad.Script('widgets/MenuPersonalCabinetWidget.js', function(){
                EventDispatcher.DispatchEvent('widget.onload.menuPersonalCabinet');
            });
        }
    };
    self.InsertContainer = {
        List: function() {
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.ordListTmplId).html());
        },
        Detail : function(){
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.ordDetailTmplId).html());
        },
        EmptyList : function(){
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.ordEmptyListTmplId).html());
        }
    };
    self.Fill = {
        List : function(){
            self.BaseLoad.OrderList(function(data){
                if(!data.err){
                    self.InsertContainer.List();
                    var list = Parameters.cache.order.list;
                    if ($.isEmptyObject(list)) {
                        list = new OrderListViewModel();
                        Parameters.cache.order.list = list;
                    }
                    list.AddContent(data);
                    self.Render.List(list);
                }
                else{
                    self.InsertContainer.EmptyList();
                    self.Render.EmptyList();
                }
            });
        },
        Detail : function(id){
            self.BaseLoad.OrderInfo(id + '/yes', function(data){
                self.InsertContainer.Detail();
                var order = Parameters.cache.order.info;
                if ($.isEmptyObject(order)) {
                    order = new OrderListShowItemViewModel();
                    Parameters.cache.order.info = order;
                }
                order.AddContent(data);
                self.Render.Detail();
            });
        }
    };
    self.Render  = {
        List : function(data){
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(data, $("#" + self.settings.containerFormId)[0]);
            }
            new AnimateOrderList();
            self.WidgetLoader(true);
        },
        EmptyList : function(){
            self.WidgetLoader(true);
        },
        Detail : function(){
            self.WidgetLoader(true);
        }
    };
    self.SetPosition = function() {
        if (self.settings.inputParameters['position'] == 'absolute') {
            for (var key in self.settings.inputParameters) {
                if (self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function() {
                for (var i = 0; i <= Config.Containers.registration.length - 1; i++) {
                    $("#" + Config.Containers.registration[i]).css(self.settings.style);
                }
            });
        }
    };
};

var OrderListViewModel = function(){
    var self = this; 
    self.list = ko.observableArray();
    self.paging = ko.observableArray();
    self.count = 0;
    
    self.AddContent = function(data){
        self.list = ko.observableArray();
        var start = Routing.GetCurrentPage() * Config.Paging.itemsPerPage - Config.Paging.itemsPerPage;
        var end = Routing.GetCurrentPage() * Config.Paging.itemsPerPage -1;
        var page = data.slice(start, end);
        
        for (var i = 0; i <= page.length-1; i++){
            self.list.push(new OrderListDetailViewModel(page[i]));
        }
        self.count = data.length;
        self.AddPages();
    };
    self.AddPages = function(){
        var ClickLinkPage = function(){
            Loader.Indicator('OrderListWidget', false);

            Routing.UpdateHash({page : this.pageId});
        }
        
        self.paging = Paging.GetPaging(self.count, {paging : Config.Paging}, ClickLinkPage);
    }
};

var OrderListDetailViewModel = function(data){
    var self = this;
    self.id = data.id;
    self.cssFloatPopup = 'order_item';
    self.dateCreate = data.date_create;
    self.commentBuyer = data.comment_buyer;
    self.commentOperator = data.comment_operator;
    self.nameShop = data.name_shop;
    self.costShipping = data.cost_shipping;
    self.costPayment = data.cost_payment;
    self.sellCost = data.sell_cost;
    self.finalCost = data.final_cost + ' руб.';
    self.GetIconPay = function(status){
        if(status == 'wait_check')
            return Config.Base.pathToImages + '/_check.png';
        if(status == 'wait_pay')
            return Config.Base.pathToImages + '/_receipt_invoice.png';
        if(status == 'paid')
            return Config.Base.pathToImages + '/_coins.png';
        if(status == 'cancel')
            return Config.Base.pathToImages + '/_cancel_icon.png';
        if(status == 'back')
            return Config.Base.pathToImages + '/_arrow_return.png';
        return false;
    };
    self.GetNamePay = function(status){
        if(status == 'wait_check')
            return 'На проверке';
        if(status == 'wait_pay')
            return 'Ожидает оплаты';
        if(status == 'paid')
            return 'Оплачен';
        if(status == 'cancel')
            return 'Отменена';
        if(status == 'back')
            return 'Возвращена';
        return false;
    };
    self.GetIconOrder = function(status){
        if(status == 'init')
            return Config.Base.pathToImages + '/_bricks.png';
        if(status == 'new')
            return Config.Base.pathToImages + '/_check.png';
        if(status == 'process')
            return Config.Base.pathToImages + '/_hourglass.png';
        if(status == 'send')
            return Config.Base.pathToImages + '/_delivery.png';
        if(status == 'delivered')
            return Config.Base.pathToImages + '/_box_receive.png';
        if(status == 'cancel')
            return Config.Base.pathToImages + '/_cancel_icon.png';
        return false;
    };
    self.GetNameOrder = function(status){
        if(status == 'init')
            return 'Формируется';
        if(status == 'new')
            return 'Новый';
        if(status == 'process')
            return 'В просессе обработки';
        if(status == 'send')
            return 'Отправлен';
        if(status == 'delivered')
            return 'Получен покупателем';
        if(status == 'cancel')
            return 'Отменен';
        return false;
    };
    self.statusPayName = self.GetNamePay(data.status_pay);
    self.statusPayIcon = self.GetIconPay(data.status_pay);
    self.statusOrderName = self.GetNameOrder(data.status_order);
    self.statusOrderIcon = self.GetIconOrder(data.status_order);
    
    self.viewShow = ko.computed(function() {
        return true;
    }, this);
    self.Show = function(){
        Routing.SetHash('purchases', 'Мои покупки', {block: 'detail', id: self.id});
    };
    self.viewEdit = ko.computed(function() {
        var s = data.status_order;
        if(s == 'init')
            return true;
        return false;
    }, this);
    self.Edit = function(){
        
    };
    self.viewToCart = ko.computed(function() {
        var s = data.status_order;
        if(s == 'init')
            return true;
        return false;
    }, this);
    self.ToCart = function(){
        
    };
    self.viewCanсel = ko.computed(function() {
        var s = data.status_order;
        if(s == 'init' || s == 'new')
            return true;
        return false;
    }, this);
    self.Cancel = function(){
        
    };
    self.viewCheck = ko.computed(function() {
        var s = data.status_order;
        if(s == 'init')
            return true;
        return false;
    }, this);
    self.Check = function(){
        
    };
    self.viewPay = ko.computed(function() {
        var s = data.status_order;
        if(s == 'new')
            return true;
        return false;
    }, this);
    self.Pay = function(){
        
    };
};

var OrderListShowItemViewModel = function(){
    var self = this;
    self.id = ko.observable();
    self.nameShipping = ko.observable();
    self.shippingAddress = ko.observable();
    self.namePayment = ko.observable();
    self.dateCreate = ko.observable();
    self.commentBuyer = ko.observable();
    self.commentOperator = ko.observable();
    self.realShipping = ko.observable();
    self.statusPay = ko.observable();
    self.statusOrder = ko.observable();
    self.trackNumber = ko.observable();
    self.idUser = ko.observable();
    self.idShop = ko.observable();
    self.idOwnShop = ko.observable();
    self.costShipping = ko.observable();
    self.costPayment = ko.observable();
    self.sellCost = ko.observable();
    self.finalCost = ko.observable();
    self.discount = ko.observable();
    self.discountSum = ko.observable();
    self.delivery = ko.observable();
    self.goods = ko.observableArray();
    
    self.AddContent = function(data){
        var order = data.order;
        self.id(order.id);
        if (order.hasOwnProperty('method_shipping')){
            if(order.method_shipping.hasOwnProperty('name_method_shipping'))
                self.nameShipping(order.method_shipping.name_method_shipping);
        }
        if (order.hasOwnProperty('shipping_address'))
            self.shippingAddress(order.shipping_address);
        if (order.hasOwnProperty('method_payment')){
            if (order.method_payment.hasOwnProperty('name_payment'))
            self.namePayment(order.method_payment.name_payment);
        }
        if (order.hasOwnProperty('date_create'))
            self.dateCreate(order.date_create);
        if (order.hasOwnProperty('comment_buyer'))
            self.commentBuyer(order.comment_buyer);
        if (order.hasOwnProperty('comment_operator'))
            self.commentOperator(order.comment_operator);
        if (order.hasOwnProperty('shipping')) {
            if (order.shipping == 'yes')
                self.realShipping(true);
            else
                self.realShipping(false);
        }
        if (order.hasOwnProperty('status_pay'))
            self.statusPay(order.status_pay);
        if (order.hasOwnProperty('status_order'))
            self.statusOrder(order.status_order);
        if (order.hasOwnProperty('track_number'))
            self.trackNumber(order.track_number);
        if (order.hasOwnProperty('id_user'))
            self.idUser(order.id_user);
        if (order.hasOwnProperty('id_shop'))
            self.idShop(order.id_shop);
        if (order.hasOwnProperty('id_own_shop'))
            self.idOwnShop(order.id_own_shop);
        if (order.hasOwnProperty('cost_shipping'))
            self.costShipping(order.cost_shipping + ' руб');
        if (order.hasOwnProperty('cost_payment'))
            self.costPayment(order.cost_payment + ' руб');
        if (order.hasOwnProperty('sell_cost'))
            self.sellCost(order.sell_cost);
        if (order.hasOwnProperty('final_cost'))
            self.finalCost((order.final_cost + order.cost_shipping + order.cost_payment) + ' руб');

        self.goods = ko.observableArray();

        var sell = 0;
        var end = 0;
        $.each(data.goods, function(i) {
            self.goods.push(new OrderItemFormStep5ViewModel(data.goods[i]))
            sell = sell + data.goods[i].sell_cost;
            end = end + data.goods[i].final_cost;
        });
        var diff = sell - end;
        var d = Math.floor(diff * 100 / sell);
        var discount = '';
        if (d > 0)
            discount = d + '%';

        self.discount = ko.observable(discount);
        self.discountSum = ko.observable(diff + 'руб');

        self.delivery(Parameters.cache.order.delivery);
    };
    self.Back = function(){
        Routing.SetHash('purchases', 'Мои покупки', {block: 'list', page : Routing.GetLastPageNumber()});
    }
};

var TestOrderList = {
    Init: function() {
        if (typeof Widget == 'function') {
            OrderListWidget.prototype = new Widget();
            var orderList = new OrderListWidget();
            orderList.Init(orderList);
        }
        else {
            setTimeout(function() {
                TestOrderList.Init()
            }, 100);
        }
    }
};

TestOrderList.Init();


