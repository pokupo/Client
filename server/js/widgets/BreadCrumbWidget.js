var BreadCrumbWidget = function(conteiner){
    var self = this;
    self.breadCrumb = {};
    self.breadCrumbViewModel = null;
    self.settingBreadCrumb = {
        containerIdForBreadCrumb : conteiner, 
        tmplForBreadCrumb : "breadCrumb/breadCrumbTmpl.html",
        inputParameters : {},
        styleCatalog : {
            'position' : 'absolute', 
            'top' : '100px', 
            'left' : '5%', 
            'width' : '20%', 
            'height' : '200px', 
            'background' : '#ddd'
        }
    };
    self.InitWidget = function(){
        self.CreateContainer();
        self.RegisterEvents();
    };
    self.Load = {
        Section : function(id){
            if(!Parameters.cache.childrenCategory[id]){
                XDMTransport.LoadData(self.settings.dataForCatalog + "&parentId=" + id, function(data){
                    Parameters.cache.childrenCategory[id] = data;
                    self.FillDataSelectListBreadCrumb(JSON.parse(data), id);
                })
            }
            else{
                self.FillDataSelectListBreadCrumb(JSON.parse(Parameters.cache.childrenCategory[id]), id);
            }
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.LoadTmpl(self.settingBreadCrumb.tmplForBreadCrumb, function(){
                EventDispatcher.DispatchEvent('onload.breadCrumb.tmpl')
                });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.LoadTmpl(self.settingBreadCrumb.tmplForBreadCrumb, function(){
                    EventDispatcher.DispatchEvent('onload.breadCrumb.tmpl')
                    });
            });
        }
        
        EventDispatcher.AddEventListener('onload.breadCrumb.tmpl', function (data){
            self.LoadPath();
        });
        
        EventDispatcher.AddEventListener('widget.changeHash', function (data){
            for(var i=0; i<=conteiner.length-1; i++){
                $("#" + self.settingBreadCrumb.containerIdForBreadCrumb[i]).hide();
            }
            self.LoadPath(); 
        });
        
        EventDispatcher.AddEventListener('onload.data.path', function (data){
            self.FillDataBreadCrumb(data);
        });
        
        EventDispatcher.AddEventListener('breadCrumbWidget.fill.item', function (data){
            self.Render.BreadCrumb(data);
        });
        
        EventDispatcher.AddEventListener('breadCrumbWidget.rendered.item', function(data){
            for(var i = 0; i <= data.crumbs().length-1; i++){
                self.Load.Section(data.crumbs()[i].id);
            }
        });
        
        EventDispatcher.AddEventListener('breadCrumbWidget.fill.selectList', function(data){
            self.Render.SelectList(data);
        });
    };
    self.FillDataBreadCrumb = function(data){
        var breadCrumb = new BreadCrumbViewModel();
        breadCrumb.AddCrumbs(data);
    };
    self.FillDataSelectListBreadCrumb = function(data, id){
        var crumb = new SelectListBreadCrumbItemViewModel();
        crumb.AddSelectList(data, id);
    };
    self.Render = {
        BreadCrumb : function(data){
            for(var i=0; i<=conteiner.length-1; i++){
                $("#" + self.settingBreadCrumb.containerIdForBreadCrumb[i]).html("");
                $("#" + self.settingBreadCrumb.containerIdForBreadCrumb[i]).append($('script#breadCrumbTmpl').html()).show();
                ko.applyBindings(data, $('#' + self.settingBreadCrumb.containerIdForBreadCrumb[i])[0]);
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
                for(var i=0; i<=conteiner.length-1; i++){
                    $("#" + self.settingBreadCrumb.containerIdForBreadCrumb[i]).hide();
                }
                self.BaseLoad.Info($('.' + data.cssSelectList + ' select').getSetSSValue(),  function(data){
                    EventDispatcher.DispatchEvent('widget.click.item', data)})
            });
        }
    }
}

var BreadCrumbItem = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.cssItem = 'pathItem_' + data.id;
}

var BreadCrumbViewModel = function(){
    var self = this;
    self.lastItem = "";
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
            self.lastItem = self.crumbs().pop().title;
            EventDispatcher.DispatchEvent('breadCrumbWidget.fill.item', self);
        }
    };
}

var SelectListBreadCrumbItem = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.ClickItem = function(){
        alert('ff');
    }
}

var SelectListBreadCrumbItemViewModel = function(){
    var self = this;
    self.parentId = 0;
    self.cssSelectList = '';
    self.listCrumbs = ko.observableArray();
    self.AddSelectList = function(data, id){
        if(data && data.items){
            for(var i = 0; i <= data.items.length - 1; i++){
                if(!Parameters.crumbsTitle[data.items[i].id])
                    self.listCrumbs.push(new SelectListBreadCrumbItem(data.items[i]));
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
            var breadCrumb = new BreadCrumbWidget(['breadCrumb_1', 'breadCrumb_2']);
            breadCrumb.Init();
        }
        else{
            window.setTimeout(TestBreadCrumb.Init, 100);
        }
    }
}

TestBreadCrumb.Init();


