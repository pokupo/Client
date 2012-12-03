var BreadCrumbWidget = function(conteiner){
    var self = this;
    self.breadCrumb = {};
    self.breadCrumbViewModel = null;
    self.settingsBreadCrumb = {
        containerIdForBreadCrumb : conteiner, 
        tmplForBreadCrumb : "breadCrumb/breadCrumbTmpl.html",
        inputParameters : {},
        styleBreadCrumb : {
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
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
            self.BaseLoad.Path(Parameters.lastItem, function(data){EventDispatcher.DispatchEvent('onload.data.path', data)});
        });
        
        EventDispatcher.AddEventListener('widget.changeHash', function (data){
            for(var i=0; i<=conteiner.length-1; i++){
                $("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i]).hide();
            }
            self.BaseLoad.Path(Parameters.lastItem, function(data){EventDispatcher.DispatchEvent('onload.data.path', data)}); 
        });
        
        EventDispatcher.AddEventListener('onload.data.path', function (data){
            self.Fill.BreadCrumb(data);
        });
        
        EventDispatcher.AddEventListener('breadCrumbWidget.fill.item', function (data){
            self.Render.BreadCrumb(data);
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
            for(var i=0; i<=conteiner.length-1; i++){
                $("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i]).html("");
                $("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i]).append($('script#breadCrumbTmpl').html()).show();
                ko.applyBindings(data, $('#' + self.settingsBreadCrumb.containerIdForBreadCrumb[i])[0]);
                 delete data;
            }
            EventDispatcher.DispatchEvent('breadCrumbWidget.rendered.item', data);
        },
        SelectList : function(data){
            for(var i=0; i<=conteiner.length-1; i++){
                $("#" + conteiner[i] + ' .' + data.cssSelectList).append($('script#breadCrumbSelectListTmpl').html());
                ko.applyBindings(data, $("#" + conteiner[i] + ' .' + data.cssSelectList + ' select')[0]);
            }
            
            $('.' + data.cssSelectList + ' select').sSelect({
                defaultText: Parameters.crumbsTitle[data.parentId]
            }).change(function(){
                var id = $('.' + data.cssSelectList + ' select').getSetSSValue();
                for(var i=0; i<=conteiner.length-1; i++){
                    $("#" + self.settingsBreadCrumb.containerIdForBreadCrumb[i]).html("");
                }
                self.BaseLoad.Info( id,  function(data){
                    EventDispatcher.DispatchEvent('widget.click.item', data)})
            });
            delete data;
        }
    }
    self.SetPosition = function(){
        if(self.settingsBreadCrumb.inputParameters['position'] == 'absolute'){
            for(var key in self.settingsBreadCrumb.inputParameters){
                if(self.settingsBreadCrumb.styleBreadCrumb[key])
                    self.settingsBreadCrumb.styleBreadCrumb[key] = self.settingsBreadCrumb.inputParameters[key];
            }
            $().ready(function(){
                for(var i=0; i<=conteiner.length-1; i++){
                    $("#" + conteiner[i]).css(self.settingsBreadCrumb.styleBreadCrumb);
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
}

var BreadCrumbViewModel = function(){
    var self = this;
    self.lastItem = "";
    self.isCategory = false;
    self.crumbs = ko.observableArray();
    self.ToHomepage = function(){
        window.location.hash = '';
        EventDispatcher.DispatchEvent('widget.click.item')
    };
    self.AddCrumbs = function(data){
        Parameters.crumbsTitle = [];
        if(data){
            for(var i = 0; i <= data.length - 1; i++){
                Parameters.crumbsTitle[data[i].id] = data[i].name_category;
                self.crumbs.push(new BreadCrumbItem(data[i]));
            }
            var last = self.crumbs().pop();
            self.lastItem = last.title;
            
            if(last.typeCategory == 'category' || last.typeCategory == 'block'){
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
                if(!Parameters.crumbsTitle[data[i].id])
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
        if(typeof Widget == 'function' && JSCore !== undefined){
            BreadCrumbWidget.prototype = new Widget();
            var breadCrumb = new BreadCrumbWidget(['breadCrumb_1']);
            breadCrumb.Init();
        }
        else{
            window.setTimeout(TestBreadCrumb.Init, 100);
        }
    }
}

TestBreadCrumb.Init();


