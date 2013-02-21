var Route = {
    route : '',
    title : Config.Base.title,
    params : {},
    more : {},
    SetHash : function(route, title, data, ret){
        this.route = route;
        this.more = {};
        var params = [];
        this.title = title;
        
        for(var key in data){
            if(data[key] && key != 'idCategories'){
                if(key != 'page')
                    params.push(key + '=' + decodeURIComponent(data[key]));
                else if(data[key] != 1)
                    params.push(key + '=' + data[key]);
            }
        }
        var href = '/' + route + '/' + params.join("&");

        window.location.hash = href;
        document.title = this.title;
        
        this.ParserHash();
        EventDispatcher.DispatchEvent('widget.change.route');
    },
    ParserHash: function(init){
        var hash = window.location.hash;
        hash = hash.split("/");
        
        if(hash[1])
           this.route = hash[1];
        else
           this.route = 'catalog';
       
        this.params = {};
            
        if(hash[2]){
            var parameters = hash[2].split('&');
            for(var i = 0; i <= parameters.length-1; i++){
                var parameter = parameters[i].split('='); 
                this.params[parameter[0]] = parameter[1];
            }
        }
        if(init)
            this.InitHistory();
        else 
            this.AddHistory()
    },
    InitHistory : function(){
        if(Parameters.cache.history.length == 0)
            this.AddHistory();
    },
    AddHistory : function(){
        Parameters.cache.history.push({route:this.route, title:this.title, data:this.params});
    },
    GetActiveCategory : function(){
        if(this.route == 'catalog' || this.route == 'goods'){
            if(this.params.category)
                return this.params.category;
            if(this.params.section)
                return this.params.section;
        }
        if(this.route == 'search'){
            if(this.params.idCategories && this.params.idCategories.split(",").length == 1)
                return parseInt(this.params.idCategories);
        }
        
        return this.GetDefaultSection();
    },
    GetDefaultSection : function(){
        if(Config.Base.defaultSection == null){
            for(var key in Parameters.cache.catalogs){
                return Parameters.cache.catalogs[key];
                break;
            }
        }
        return Config.Base.defaultSection;
    },
    IsCategory : function(){
        if(this.route == 'catalog'){
            if(this.params.category)
                return true;
        }
        return false;
    },
    GetCategory : function(){
        if(this.route == 'catalog'){
            if(this.params.category)
                return this.params.category;
        }
        return 0;
    },
    IsSection : function(){
        if(this.route == 'catalog'){
            if(!this.params.category)
                return true;
        }
        return false;
    },
    GetSection : function(){
        if(this.route == 'catalog'){
            if(this.params.section)
                return this.params.section;
        }
        return 0;
    },
    GetPath : function(data){
        if(data[data.length-1].type_category == 'category'){
           return {section : data[data.length-2].id, category : data[data.length-1].id};
        }
        return {section : data[data.length-1].id};
    },
    UpdateHash : function(opt){
        for(var key in opt){
            this.params[key] = opt[key];
        }
        
        var params = [];
        for(var key in this.params){
            if(key != 'page')
                params.push(key + '=' + decodeURIComponent(this.params[key]));
            else if(this.params[key] != 1)
                params.push(key + '=' + this.params[key]);
        }
        var href = '/' + this.route + '/' + params.join("&");
        
        window.location.hash = href;
        
        Parameters.cache.history.push({route:this.route, title:document.title, data:this.params});
        
        this.ParserHash();
        EventDispatcher.DispatchEvent('widget.change.route');
    },
    UpdateMoreParameters : function(opt){
        for(var key in opt){
            this.more[key] = opt[key];
        }
    },
    SetMoreParameters : function(opt){
        this.more = opt;
    },
    GetMoreParameter : function(name){
        if(this.more[name])
            return this.more[name];
        return '';
    },
    GetCurrentPage : function(){
        if(this.params.page)
            return parseInt(this.params.page);
        return 1;
    }
}


