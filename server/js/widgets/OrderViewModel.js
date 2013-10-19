var OrderViewModel = function(){
    var self = this;
    self.id = ko.observable();
    
    self.nameMethodShipping = ko.observable();
    self.logoMethodShipping = ko.observable();
    
    self.shippingCountry = ko.observable();
    self.shippingRegion = ko.observable();
    self.shippingCity = ko.observable();
    self.shippingPostCode = ko.observable();
    self.shippingAddress = ko.observable();
    self.shippingAddressee = ko.observable();
    self.shippingContactPhone = ko.observable();
    
    self.namePayment = ko.observable();
    self.logoPayment = ko.observable();
    self.timePayment = ko.observable();
    self.descPayment = ko.observable();
    
    self.invoicePayment = ko.observable();
    self.dateCreate = ko.observable();
    self.commentBuyer = ko.observable();
    self.commentOperator = ko.observable();
    self.realShipping = ko.observable();
    self.statusPay = ko.observable();
    self.statusOrder = ko.observable();
    self.trackNumber = ko.observable();
    self.nameShop = ko.observable();
    self.nameOwnShop = ko.observable();
    
    self.costShipping = ko.observable('0 руб.');
    self.costPayment = ko.observable('0 руб.');
    self.sellCost = ko.observable();
    self.finalCost = ko.observable();
    self.discount = ko.observable();
    self.discountSum = ko.observable();
    self.itog = ko.observable();
    
    self.goods = ko.observableArray();
    
    self.AddContent = function(data){
        var order = data.order;
        self.id(order.id);
        if (order.hasOwnProperty('method_shipping')){
            if(order.method_shipping.hasOwnProperty('name_method_shipping'))
                self.nameMethodShipping(order.method_shipping.name_method_shipping);
            if(order.method_shipping.hasOwnProperty('logo_shipping_company'))
                self.logoMethodShipping(order.method_shipping.logo_shipping_company);
        }
        if (order.hasOwnProperty('shipping')) {
            if (order.shipping == 'yes')
                self.realShipping(true);
            else
                self.realShipping(false);
        }
        if (order.hasOwnProperty('shipping_address')){
            if (order.shipping_address.hasOwnProperty('country'))
                self.shippingCountry(order.shipping_address.country);
            if (order.shipping_address.hasOwnProperty('region'))
                self.shippingRegion(order.shipping_address.region);
            if (order.shipping_address.hasOwnProperty('city'))
                self.shippingCity(order.shipping_address.city);
            if (order.shipping_address.hasOwnProperty('post_code'))
                self.shippingPostCode(order.shipping_address.post_code);
            if (order.shipping_address.hasOwnProperty('address'))
                self.shippingAddress(order.shipping_address.address);
            if (order.shipping_address.hasOwnProperty('addressee'))
                self.shippingAddressee(order.shipping_address.addressee);
            if (order.shipping_address.hasOwnProperty('contact_phone'))
                self.shippingContactPhone(order.shipping_address.contact_phone);
        }
        else{
            self.realShipping(false);
        }
        
        if (order.hasOwnProperty('method_payment')){
            if (order.method_payment.hasOwnProperty('name_payment'))
                self.namePayment(order.method_payment.name_payment);
            if (order.method_payment.hasOwnProperty('logo_payment'))
                self.logoPayment(order.method_payment.logo_payment);
            if (order.method_payment.hasOwnProperty('time_payment'))
                self.timePayment(order.method_payment.time_payment);
            if (order.method_payment.hasOwnProperty('desc_payment'))
                self.descPayment(order.method_payment.desc_payment);
        }
        
        if (order.hasOwnProperty('invoice_payment'))
            self.invoicePayment(order.invoice_payment);
        if (order.hasOwnProperty('date_create'))
            self.dateCreate(order.date_create);
        if (order.hasOwnProperty('comment_buyer'))
            self.commentBuyer(order.comment_buyer);
        if (order.hasOwnProperty('comment_operator'))
            self.commentOperator(order.comment_operator);
        if (order.hasOwnProperty('status_pay'))
            self.statusPay(order.status_pay);
        if (order.hasOwnProperty('status_order'))
            self.statusOrder(order.status_order);
        if (order.hasOwnProperty('track_number'))
            self.trackNumber(order.track_number);
        if (order.hasOwnProperty('name_shop'))
            self.nameShop(order.name_shop);
        if (order.hasOwnProperty('name_own_shop'))
            self.nameOwnShop(order.name_own_shop);
        var itog = 0;
        if (order.hasOwnProperty('cost_shipping')){
            self.costShipping(order.cost_shipping + ' руб');
            itog = order.cost_shipping;
        }
        if (order.hasOwnProperty('cost_payment')){
            self.costPayment(order.cost_payment + ' руб');
            itog = itog + order.cost_payment;
        }
        if (order.hasOwnProperty('sell_cost'))
            self.sellCost(order.sell_cost);
        if (order.hasOwnProperty('final_cost')){
            self.finalCost(order.final_cost + ' руб');
            itog = itog + order.final_cost;
        }
        self.itog(itog + ' руб')

        self.goods = ko.observableArray();

        var sell = 0;
        var end = 0;
        $.each(data.goods, function(i) {
            self.goods.push(new OrderGoodsViewModel(data.goods[i]))
            sell = sell + data.goods[i].sell_cost;
            end = end + data.goods[i].final_cost;
        });
        var diff = sell - end;
        var d = Math.floor(diff * 100 / sell);
        var discount = '0%';
        if (d > 0)
            discount = d + '%';

        self.discount = ko.observable(discount);
        self.discountSum = ko.observable(diff + 'руб');
        
        self.ClickConfirm = function(){
            EventDispatcher.DispatchEvent('OrderWidget.step5.confirm', {comment: self.commentBuyer()});
        };
    };
};

var OrderGoodsViewModel = function(data) {
    var self = this;
    self.id = data.id;
    self.fullName = data.full_name;
    self.sellCost = data.sell_cost + ' руб';
    self.itogSellCost = (data.sell_cost * data.count) + ' руб';
    self.finalCost = data.final_cost + ' руб';
    self.count = data.count + ' шт';
    self.routeImage = Config.Base.pathToImages + data.route_image;
    if (data.is_egoods == 'yes')
        self.isEgoods = true;
    else
        self.isEgoods = false;
    
    self.isEgoodsPaid = ko.computed(function() {
        if(data.hasOwnProperty('egoods'))
            return true;
        return false;
    }, this);
    if(self.isEgoodsPaid()){
        self.uploadFile = 'https://' + window.location.hostname + data.egoods.upload_file;
        self.sizeFile = data.egoods.size_file;
        self.countUpload = data.egoods.count_upload;
        self.expiration = data.egoods.expiration;
        self.maxUpload = data.egoods.max_upload;
    }
    self.ClickGoods = function(){
        Routing.SetHash('goods', self.chortName, {id : self.id});
    }
};


