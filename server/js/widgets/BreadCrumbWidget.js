var BreadCrumbWidget = function(){
    var self = this;
    self.widgetName = 'BreadCrumbWidget';
    self.settingsBreadCrumb = {
        containerIdForBreadCrumb : Config.Conteiners.breadCrumbs, 
        tmplForBreadCrumb : Config.BreadCrumbs.tmpl,
        inputParameters : {},
        styleBreadCrumb : Config.BreadCrumbs.style
    };
    self.InitWidget = function(){
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settingsBreadCrumb.inputParameters = JSCore.ParserInputParameters(/BreadCrumbWidget.js/);
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settingsBreadCrumb.tmplForBreadCrumb, function(){
                EventDispatcher.DispatchEvent('onload.breadCrumb.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settingsBreadCrumb.tmplForBreadCrumb, function(){
                    EventDispatcher.DispatchEvent('onload.breadCrumb.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('onload.breadCrumb.tmpl', function (data){
            self.BaseLoad.Path(Route.GetActiveCategory(), function(data){
                EventDispatcher.DispatchEvent('breadCrumbWidget.onload.path', data)
            });
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            ReadyWidgets.Indicator('BreadCrumbWidget', false );

            self.BaseLoad.Path(Route.GetActiveCategory(), function(data){
                EventDispatcher.DispatchEvent('breadCrumbWidget.onload.path', data)
            }); 
        });
        
        EventDispatcher.AddEventListener('widget.route.change.breadCrumbs', function(id){
            ReadyWidgets.Indicator('BreadCrumbWidget', false );

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
                ReadyWidgets.Indicator('BreadCrumbWidget', true );
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
            for(var i=0; i<=self.settingsBreadCrumb.containerIdForBreadCrumb.length-1; i++){
                if($("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i]).length > 0){
                    $("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i]).html("");
                    $("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i]).append($('script#breadCrumbTmpl').html());
                    ko.applyBindings(data, $('#' + self.settingsBreadCrumb.containerIdForBreadCrumb[i])[0]);
                }
                delete data;
            }
            EventDispatcher.DispatchEvent('breadCrumbWidget.rendered.item', data);
        },
        SelectList : function(data){
            for(var i=0; i<=self.settingsBreadCrumb.containerIdForBreadCrumb.length-1; i++){
                if($("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i] + ' .' + data.cssSelectList).length > 0){
                    $("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i] + ' .' + data.cssSelectList).append($('script#breadCrumbSelectListTmpl').html());
                    ko.applyBindings(data, $("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i] + ' .' + data.cssSelectList + ' select')[0]);
                }
            }
            
            if($('.' + data.cssSelectList + ' select').length > 0){
                $('.' + data.cssSelectList + ' select').sSelect({
                    defaultText: Parameters.cache.crumbsTitle[data.parentId]
                }).change(function(){
                    ReadyWidgets.Indicator('BreadCrumbWidget', false );
                    var id = $('.' + data.cssSelectList + ' select').getSetSSValue();
                    for(var i=0; i<=self.settingsBreadCrumb.containerIdForBreadCrumb.length-1; i++){
                        $("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i]).html("");
                    }

                    self.BaseLoad.Path(id, function(data){
                        Route.SetHash('catalog', data[data.length-1].name_category, Route.GetPath(data));
                    });
                });
            }
            delete data;
            
            ReadyWidgets.Indicator('BreadCrumbWidget', true );
        }
    }
    self.SetPosition = function(){
        if(self.settingsBreadCrumb.inputParameters['position'] == 'absolute'){
            for(var key in self.settingsBreadCrumb.inputParameters){
                if(self.settingsBreadCrumb.styleBreadCrumb[key])
                    self.settingsBreadCrumb.styleBreadCrumb[key] = self.settingsBreadCrumb.inputParameters[key];
            }
            $().ready(function(){
                for(var i=0; i<=self.settingsBreadCrumb.containerIdForBreadCrumb.length-1; i++){
                    $("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i]).css(self.settingsBreadCrumb.styleBreadCrumb);
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
    self.lastItem = "";
    self.title = "";
    self.isCategory = false;
    self.crumbs = ko.observableArray();
    self.ToHomepage = function(){
        ReadyWidgets.Indicator('BreadCrumbWidget', false);
        Route.SetHash('catalog', 'Домашняя', {});
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
            
            self.lastItem = last.title;
            
            if(Route.route == 'search')
                self.title = 'Расширенный поиск';
            else
                self.title = last.title;
            
            if(last.typeCategory == 'category' || last.typeCategory == 'block' || Route.route == 'search'){
                self.isCategory = true;
            }
            else{
                self.isCategory = false;
            }
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
            window.setTimeout(TestBreadCrumb.Init, 100);
        }
    }
}

TestBreadCrumb.Init();

