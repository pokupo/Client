var BreadCrumbWidget = function(){
    var self = this;
    self.widgetName = 'BreadCrumbWidget';
    self.settings = {
        containerId : null, 
        tmplPath : null,
        tmplId : null,
        tmplSelectListId : null,
        inputParameters : {},
        styleBreadCrumb : null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.breadCrumbs; 
        self.settings.tmplPath = Config.BreadCrumbs.tmpl.path;
        self.settings.tmplId = Config.BreadCrumbs.tmpl.tmplId;
        self.settings.tmplSelectListId = Config.BreadCrumbs.tmpl.tmplSelectListId;
        self.settings.styleBreadCrumb = Config.BreadCrumbs.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/BreadCrumbWidget.js/);
            if(temp.breadCrumb){
                input = temp.breadCrumb;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.breadCrumb){
            input = WParameters.breadCrumb;
        }
        self.settings.inputParameters = input;
    };
    self.GetTmplRoute = function(){
        return self.settings.tmplPath + self.settings.tmplId + '.html';
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                EventDispatcher.DispatchEvent('onload.breadCrumb.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                    EventDispatcher.DispatchEvent('onload.breadCrumb.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('onload.breadCrumb.tmpl', function (data){
            self.BaseLoad.Path(Routing.GetActiveCategory(), function(data){
                EventDispatcher.DispatchEvent('breadCrumbWidget.onload.path', data)
            });
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            self.WidgetLoader(false );

            self.BaseLoad.Path(Routing.GetActiveCategory(), function(data){
                EventDispatcher.DispatchEvent('breadCrumbWidget.onload.path', data)
            }); 
        });
        
        EventDispatcher.AddEventListener('widget.route.change.breadCrumbs', function(id){
            self.WidgetLoader(false );

            self.BaseLoad.Path(id, function(data){
                EventDispatcher.DispatchEvent('breadCrumbWidget.onload.path', data)
            });
        })
        
        EventDispatcher.AddEventListener('breadCrumbWidget.onload.path', function (data){
            self.Fill.BreadCrumb(data);
        });
        
        EventDispatcher.AddEventListener('breadCrumbWidget.fill.item', function (data){ 
            self.Render.BreadCrumb(data);
            if(data.crumbs().length == 0)
                self.WidgetLoader(true );
        });
        
        EventDispatcher.AddEventListener('breadCrumbWidget.click.item', function(item){
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
            for(var i=0; i<=self.settings.containerId.length-1; i++){
                if($("#" + self.settings.containerId[i]).length > 0){
                    $("#" + self.settings.containerId[i]).empty().append($('script#' + self.settings.tmplId).html());
                    ko.applyBindings(data, $('#' + self.settings.containerId[i])[0]);
                    new AnimateBreadCrumb(data.cssItem);
                }
                delete data;
            }
            self.WidgetLoader(true );
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
    self.ClickItem = function(){
        
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
    self.cssItem = 'breadcrumbs_item';
    
    self.ToHomepage = function(){
        Routing.SetHash('catalog', 'Домашняя', {});
    };
    self.showReturn = ko.computed(function(){
        if(Parameters.cache.history.length > 1)
            return true
        return false;
    }, this);
    self.Return = function(){
        Parameters.cache.history.pop();
        var link = Parameters.cache.history.pop();
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
            
            if(Routing.route == 'goods')
                self.lastItem('Карточка товара');
            if(Routing.route == 'cart'){
                self.crumbs = ko.observableArray();
                self.lastItem('Моя корзина');
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
            if(Routing.route == 'profile' || Routing.route == 'favorites'){
                self.crumbs = ko.observableArray();
                
                self.lastItem('Личный кабинет');
            }
            
            if(!self.lastItem()){
                var last = self.crumbs().pop();
                self.lastItem(last.title);
            }

            EventDispatcher.DispatchEvent('breadCrumbWidget.fill.item', self);
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
        EventDispatcher.DispatchEvent('breadCrumbWidget.click.item', {id : self.id});
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

