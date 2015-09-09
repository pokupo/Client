var BreadCrumbWidget = function(){
    var self = this;
    self.widgetName = 'BreadCrumbWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        containerId : null, 
        tmpl : {
            path : null,
            id : null
        },
        animate: null,
        inputParameters : {},
        styleBreadCrumb : null,
        customContainer : null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.breadCrumb.widget;
        self.settings.customContainer = Config.Containers.breadCrumb.customClass;
        self.settings.tmpl = Config.BreadCrumb.tmpl;
        self.settings.styleBreadCrumb = Config.BreadCrumb.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.CheckRouteBreadCrumb(Routing.GetActiveCategory());
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/BreadCrumbWidget/);
            if(temp.breadCrumb){
                input = temp.breadCrumb;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.breadCrumb){
            input = WParameters.breadCrumb;
        }
        if(input.animate){
            self.settings.animate = input.animate;
        }

        self.settings.inputParameters = input;
    };
    self.InsertContainer = {
        EmptyWidget : function(i){
            var temp = $("#" + self.settings.containerId[i]).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerId[i]).empty().html(temp);
        },
        Main : function(){
            for(var i=0; i<=self.settings.containerId.length-1; i++){
                if($("#" + self.settings.containerId[i]).length > 0){
                    self.InsertContainer.EmptyWidget(i);
                    $("#" + self.settings.containerId[i]).append($('script#' + self.GetTmplName()).html()).children().hide();
                }
            }
        }
    };
    self.CheckRouteBreadCrumb = function(id){
        if(Routing.IsDefault() && self.HasDefaultContent()){
            self.WidgetLoader(true);
        }
        else{
            self.WidgetLoader(false);
            self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                if(id)
                    self.BaseLoad.Path(id, function(data){
                        self.Fill.BreadCrumb(data);
                    });
                else
                    self.WidgetLoader(true);
            });
        }
    };
    self.RegisterEvents = function(){
        EventDispatcher.AddEventListener('w.change.route', function (data){
            self.CheckRouteBreadCrumb(Routing.GetActiveCategory()); 
        });
        
        EventDispatcher.AddEventListener('w.change.breadCrumb', function(id){
            self.CheckRouteBreadCrumb(id);
        })
        
        EventDispatcher.AddEventListener('breadCrumb.fill.item', function (data){
            self.Render.BreadCrumb(data);
        });
        
        EventDispatcher.AddEventListener('breadCrumb.click.item', function(item){
            self.BaseLoad.Path(item.id, function(data){
                Routing.SetHash('catalog', data[data.length-1].name_category, Routing.GetPath(data));
            });
        });
    };
    self.Fill = {
        BreadCrumb : function(data){
            var breadCrumb = new BreadCrumbViewModel();
            breadCrumb.AddCrumbs(data);
        }
    },
    self.Render = {
        BreadCrumb : function(data){
            self.InsertContainer.Main();
            for(var i=0; i<=self.settings.containerId.length-1; i++){
                if($("#" + self.settings.containerId[i]).length > 0){
                    try{
                        ko.cleanNode($('#' + self.settings.containerId[i])[0]);
                        ko.applyBindings(data, $('#' + self.settings.containerId[i])[0]);
                        self.ShowContainer(self.settings.containerId[i]);
                        self.WidgetLoader(true );
                        if(typeof AnimateBreadCrumb == 'function')
                            new AnimateBreadCrumb();
                        if(self.settings.animate)
                            self.settings.animate();
                    }
                    catch(e){
                        self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']', e);
                        if(self.settings.tmpl.custom){
                            delete self.settings.tmpl.custom;
                            self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                                self.InsertContainer.Main();
                                self.Render.BreadCrumb(data);
                            });
                        }
                        else{
                            self.InsertContainer.EmptyWidget(i);
                            self.WidgetLoader(true);
                        }
                    }
                }
                else{
                    self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId[i] + ']');
                    self.WidgetLoader(true);
                }
                delete data;
            }
        }
    }
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.styleBreadCrumb[key])
                    self.settings.styleBreadCrumb[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                for(var i=0; i<=self.settings.containerId.length-1; i++){
                    $("#" + self.settings.containerId[i]).css(self.settings.styleBreadCrumb);
                }
            });
        }
    }
}

var BreadCrumbItem = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.typeCategory = data.type_category; 
    self.selectList = ko.observableArray();
    self.showSelectList = ko.computed(function(){
        if(self.selectList() > 0)
            return true;
        else false;
    }, this);
    self.ClickItem = function(){
        if(!self.showSelectList())
            EventDispatcher.DispatchEvent('breadCrumb.click.item', {id : self.id});
    };
    self.AddSelectList = function(children){
        for(var i = 0; i <= children.length-1; i++){
            self.selectList.push(new SelectListBreadCrumbItem(children[i]));
        }
    }
}

var BreadCrumbViewModel = function(){
    var self = this;
    self.lastItem = ko.observable();;
    self.title = "";
    self.crumbs = ko.observableArray();
    
    self.ToHomepage = function(){
        Routing.SetHash('default', 'Домашняя', {});
    };
    self.showReturn = ko.computed(function(){
        if(Parameters.cache.history.length > 1)
            return true
        return false;
    }, this);
    self.Return = function(){
        Parameters.cache.history.pop();
        var link = Parameters.cache.history.pop();
        if(link.route == 'order' && link.data.create)
            link = Parameters.cache.history.pop();
        Routing.SetHash(link.route, link.title, link.data, true);
    };
    self.AddCrumbs = function(data){
        if(data){
            for(var i = 0; i <= data.length - 1; i++){
                var breadCrumb = new BreadCrumbItem(data[i]);
                
                if(data[i].children){
                   breadCrumb.AddSelectList(data[i].children);
                }
                
                self.crumbs.push(breadCrumb);
            } 
            if(Routing.route == 'default'){
                self.crumbs = ko.observableArray();
                self.lastItem(Routing.defaultTitle);
            }
            if(Routing.route == 'goods')
                self.lastItem('Карточка товара');
            if(Routing.route == 'cart'){
                self.crumbs = ko.observableArray();
                self.lastItem('Моя корзина');
            }
            if(Routing.route == 'payment'){
                self.crumbs = ko.observableArray();
                self.lastItem('Оплата заказа');
            }
            if(Routing.route == 'registration'){
                self.crumbs = ko.observableArray();
                
                self.crumbs.push(new BreadCrumbItem({id:0, name_category: 'Регистрация покупателя'}));

                if(Routing.params.step == 1)
                    self.lastItem('Шаг 1');
                if(Routing.params.step == 2)
                    self.lastItem('Шаг 2');
                if(Routing.params.step == 3)
                    self.lastItem('Шаг 3');
                if(Routing.params.step == 4)
                    self.lastItem('Шаг 4');
            } 
            if(Routing.route == 'order'){
                self.crumbs = ko.observableArray();
                
                self.crumbs.push(new BreadCrumbItem({id:0, name_category: 'Оформление заказа'}));

                if(Routing.params.step == 1)
                    self.lastItem('Шаг 1');
                if(Routing.params.step == 2)
                    self.lastItem('Шаг 2');
                if(Routing.params.step == 3)
                    self.lastItem('Шаг 3');
                if(Routing.params.step == 4)
                    self.lastItem('Шаг 4');
                if(Routing.params.step == 5)
                    self.lastItem('Шаг 5');
            } 
            if(Routing.route == 'profile' || Routing.route == 'favorites' || Routing.route == 'purchases' || Routing.route == 'cabinet_cart'){
                self.crumbs = ko.observableArray();
                
                self.lastItem('Личный кабинет');
            }
            
            if(!self.lastItem()){
                var last = self.crumbs().pop();
                self.lastItem(last.title);
            }

            EventDispatcher.DispatchEvent('breadCrumb.fill.item', self);
        }
    };
}

var SelectListBreadCrumbItem = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.cssActiveItem = ko.computed(function(){
        if(Routing.route == 'catalog' && self.id == Routing.GetActiveCategory())
            return 'active';
        return '';
    }, this);
    
    self.ClickItem = function(){
        EventDispatcher.DispatchEvent('breadCrumb.click.item', {id : self.id});
    }
}

var TestBreadCrumb = {
    Init : function(){
        if(typeof Widget == 'function'){
            BreadCrumbWidget.prototype = new Widget();
            var breadCrumb = new BreadCrumbWidget();
            breadCrumb.Init(breadCrumb);
        }
        else{
            setTimeout(function(){TestBreadCrumb.Init()}, 100);
        }
    }
}

TestBreadCrumb.Init();

