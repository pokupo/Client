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
        self.settings.inputParameters = JSCore.ParserInputParameters(/BreadCrumbWidget.js/);
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
        
        EventDispatcher.AddEventListener('breadCrumbWidget.rendered.item', function(data){
            
            for(var i = 0; i <= data.crumbs().length-1; i++){ 
                self.BaseLoad.Section(data.crumbs()[i].id, function(sec){
                    self.Fill.SelectList(sec.data, sec.parentId)
                });
            }
        });
        
        EventDispatcher.AddEventListener('breadCrumbWidget.fill.selectList', function(data){
            self.Render.SelectList(data);
        });
    };
    self.Fill = {
        BreadCrumb : function(data){
            var breadCrumb = new BreadCrumbViewModel();
            breadCrumb.AddCrumbs(data);
        },
        SelectList : function(data, id){
            var crumb = new SelectListBreadCrumbItemViewModel();
            crumb.AddSelectList(data, id);
        }
    },
    self.Render = {
        BreadCrumb : function(data){
            for(var i=0; i<=self.settings.containerId.length-1; i++){
                if($("#" + self.settings.containerId[i]).length > 0){
                    $("#" + self.settings.containerId[i]).html("");
                    $("#" + self.settings.containerId[i]).append($('script#' + self.settings.tmplId).html());
                    ko.applyBindings(data, $('#' + self.settings.containerId[i])[0]);
                }
                delete data;
            }
            EventDispatcher.DispatchEvent('breadCrumbWidget.rendered.item', data);
        },
        SelectList : function(data){
            for(var i=0; i<=self.settings.containerId.length-1; i++){
                if($("#" + self.settings.containerId[i] + ' .' + data.cssSelectList).length > 0){
                    $("#" + self.settings.containerId[i] + ' .' + data.cssSelectList).append($('script#' + self.settings.tmplSelectListId).html());
                    ko.applyBindings(data, $("#" + self.settings.containerId[i] + ' .' + data.cssSelectList + ' select')[0]);
                }
            }

            if($('.' + data.cssSelectList + ' select').length > 0){
                $('.' + data.cssSelectList + ' select').sSelect({
                    defaultText: Parameters.cache.crumbsTitle[data.parentId]
                }).change(function(){
                    self.WidgetLoader(false );
                    var id = $('.' + data.cssSelectList + ' select').getSetSSValue();
                    for(var i=0; i<=self.settings.containerId.length-1; i++){
                        $("#" + self.settings.containerId[i]).html("");
                    }

                    self.BaseLoad.Path(id, function(data){
                        Routing.SetHash('catalog', data[data.length-1].name_category, Routing.GetPath(data));
                    });
                });
            }
            delete data;
            
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
    self.cssItem = 'pathItem_' + data.id;
    self.selectList = ko.observableArray();
    self.AddSelectList = function(children){
        for(var i = 0; i <= children.length-1; i++){
            if(!Parameters.cache.crumbsTitle[children[i].id])
                self.selectList.push(new SelectListBreadCrumbItem(children[i]));
        }
    }
}

var BreadCrumbViewModel = function(){
    var self = this;
    self.lastItem = ko.observableArray();;
    self.title = "";
    self.crumbs = ko.observableArray();
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
        Parameters.cache.crumbsTitle = [];
        if(data){
            for(var i = 0; i <= data.length - 1; i++){
                var breadCrumb = new BreadCrumbItem(data[i]);
                
                if(data[i].children){
                   breadCrumb.AddSelectList(data[i].children);
                }
                
                Parameters.cache.crumbsTitle[data[i].id] = data[i].name_category; 
                self.crumbs.push(breadCrumb);
            }
            
            var last = self.crumbs().pop();
            self.lastItem.push(last.title);
            
            if(Routing.route == 'goods')
                self.lastItem.push('Карточка товара');

            EventDispatcher.DispatchEvent('breadCrumbWidget.fill.item', self);
        }
    };
}

var SelectListBreadCrumbItem = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
}

var SelectListBreadCrumbItemViewModel = function(){
    var self = this;
    self.parentId = 0;
    self.cssSelectList = '';
    self.listCrumbs = ko.observableArray();
    self.AddSelectList = function(data, id){
        if(data){
            for(var i = 0; i <= data.length - 1; i++){
                    self.listCrumbs.push(new SelectListBreadCrumbItem(data[i]));
            }
            self.parentId = id;
            self.cssSelectList = 'pathItem_' + id;
            EventDispatcher.DispatchEvent('breadCrumbWidget.fill.selectList', self);
        }
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

