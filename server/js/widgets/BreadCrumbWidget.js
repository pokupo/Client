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
        Path : function(){
            if(Parameters.lastItem){
                if(!Parameters.cache.path[Parameters.lastItem]){
                    XDMTransport.LoadData(self.settings.dataPathForItem + '&category=' + Parameters.lastItem, function(data){
                        var path = JSON.parse(data)['path'];
                        Parameters.cache.path[Parameters.lastItem] = path;
                        EventDispatcher.DispatchEvent('onload.data.path', path);
                    })
                }
                else{
                    EventDispatcher.DispatchEvent('onload.data.path', Parameters.cache.path[Parameters.lastItem]);
                }
            }
        },
        Section : function(id){
            if(!Parameters.cache.childrenCategory[id]){
                XDMTransport.LoadData(self.settings.dataForCatalog + "&parentId=" + id, function(data){
                    Parameters.cache.childrenCategory[id] = data;
                    self.FillDataSelectListBreadCrumb(JSON.parse(data), id);
                    self.Render.SelectList(id);
                })
            }
            else{
                self.FillDataSelectListBreadCrumb(JSON.parse(Parameters.cache.childrenCategory[id]), id);
                self.Render.SelectList(id);
            }
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.LoadTmpl(self.settingBreadCrumb.tmplForBreadCrumb, function(){EventDispatcher.DispatchEvent('onload.breadCrumb.tmpl')});
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.LoadTmpl(self.settingBreadCrumb.tmplForBreadCrumb, function(){EventDispatcher.DispatchEvent('onload.breadCrumb.tmpl')});
            });
        }
        
        EventDispatcher.AddEventListener('onload.breadCrumb.tmpl', function (data){
            self.Load.Path();
        });
        
        EventDispatcher.AddEventListener('widget.changeHash', function (data){
            self.Load.Path();
        });
        
//        EventDispatcher.AddEventListener('onload.breadCrumb.items', function (data){
//            self.Render.SelectList(data.parentId, data.items);
//        });
        
        EventDispatcher.AddEventListener('BreadCrumbWidget.click.item', function (data){
            $('.newListSelected ').removeClass('active').children('ul').hide();
            $('.' + data.cssItem).parent('.newListSelected ').addClass('active').children('ul').show();
        });
        
        EventDispatcher.AddEventListener('onload.data.path', function (data){
            self.FillDataBreadCrumb(data);
            for(var i = 0; i <= data.length-1; i++){
                self.Load.Section(data[i].id);
            }
            self.Render.BreadCrumb();
        });
    };
    self.FillDataBreadCrumb = function(data){
        var breadCrumb = [];
        if(data){
            for(var i = 0; i <= data.length - 1; i++){
                breadCrumb[i] = new BreadCrumbItem(data[i]);
            }
        }
        self.breadCrumbViewModel = BreadCrumbViewModel(breadCrumb); 
    };
    self.FillDataSelectListBreadCrumb = function(data, id){
        var crumb = [];
        if(data && data.items){
            for(var i = 0; i <= data.items.length - 1; i++){
                crumb[i] = new SelectListBreadCrumbItem(data.items[i]);
            }
        }
        self.breadCrumb = SelectListBreadCrumbItemViewModel(crumb);
        
        //EventDispatcher.DispatchEvent('onload.breadCrumb.items', {'parentId' : parentId, 'items' : items});
    };
    self.Render = {
        BreadCrumb : function(){
            for(var i=0; i<=conteiner.length-1; i++){
                $("#" + self.settingBreadCrumb.containerIdForBreadCrumb[i]).html("");
                $("#" + self.settingBreadCrumb.containerIdForBreadCrumb[i]).append($('script#breadCrumbTmpl').html());
                ko.applyBindings(self.breadCrumbViewModel, document.getElementById(self.settingBreadCrumb.containerIdForBreadCrumb[i]));
            }
        },
        SelectList : function(parentId){
            var cssUl = 'selectListBreadCrumb_' + parentId;
            $('.pathItem_' + parentId).append($('script#breadCrumbSelectListTmpl').html());
            for(var i=0; i<=conteiner.length-1; i++){
                $("#" + self.settingBreadCrumb.containerIdForBreadCrumb[i] + ' .pathItem_' + parentId + ' .selectListBreadCrumb:last').attr('id', cssUl);
            }
            //ko.applyBindings(self.breadCrumb, document.getElementById(cssUl));
        }
    }
}

var BreadCrumbItem = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.cssItem = 'pathItem_' + data.id;
    self.ClickItem = function(){
        EventDispatcher.DispatchEvent('widget.click.item', data)
    }
}

var BreadCrumbViewModel = function(breadCrumb){
    var self = this;
    self.lastItem = ko.computed(function(){
        if(breadCrumb.length > 0){
            var last = breadCrumb.pop();
            return last.title;
        }
        else{
            return "";
        }
    }, this);
    self.crumbs = ko.observableArray(breadCrumb);
}

var SelectListBreadCrumbItem = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.ClickItem = function(){
        alert('ff');
    }
}

var SelectListBreadCrumbItemViewModel = function(crumb){
    var self = this;
    self.listCrumbs = ko.observable(crumb);
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


