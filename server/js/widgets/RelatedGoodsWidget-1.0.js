window.RelatedGoodsWidget = function () {
    var self = this;
    self.widgetName = 'RelatedGoodsWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: null,
        tmpl:{
            path : "relatedGoodsTmpl.html", // файл шаблонов связанных товаров
            id : {
                table : "relatedGoodsTableTmpl", // id шаблона таблицы
                list : "relatedGoodsListTmpl", // id шаблона списка
                tile : "relatedGoodsTileTmpl", // id шаблона плитки
                slider : "relatedGoodsSliderTmpl", // id шаблона слайдера
                carousel : "relatedGoodsCarouselTmpl" // id шаблона карусели
            }
        },
        animate: typeof AnimateRelatedGoods == 'function' ? AnimateRelatedGoods : null,
        id: null,
        count : 6, // максимальное кол-во товаров в блоке
        countTile : 5, // кол-во плиток в строке
        orderBy : 'rating', // сортировка
        start : 0, // начальная позиция в запросе
        typeView : 'carousel', // тип отображения по умолчанию
        uniq: null
    };
    function InitWidget() {
        Loader.InsertContainer(settings.container);
        RegisterEvents();
        if (Loader.IsReady())
            LoadTmpl();
    }

    self.SetParameters = function (data) {
        settings.container = data.element;
        var params = data.options.params;
        for (var key in params) {
            if (key == 'tmpl' && params['tmpl']) {
                if (params.tmpl['path'])
                    settings.tmpl.path = params.tmpl['path'];
                if (params.tmpl['id']) {
                    settings.tmpl.id = params.tmpl['id'];
                }
            }
            else if (key == 'uniq' && params['uniq'])
                settings.uniq = params['uniq'];
            else if (key == 'animate' && params['animate'])
                settings.animate = params['animate'];
            else if (key == 'id')
                settings.id = params['id'];
        }

        var input = self.GetInputParameters('relatedGoods');
        if(!$.isEmptyObject(input))
            settings = self.UpdateSettings1(settings, input);

        Config.RelatedGoods = settings;
    };
    function LoadTmpl() {
        self.BaseLoad.Tmpl(settings.tmpl, function () {
            self.BaseLoad.Script(PokupoWidgets.model.content, function () {
                self.DispatchEvent('RGoods.onload.tmpl_' + settings.uniq)
            });
        });
    }

    function RegisterEvents() {
        self.AddEvent('w.ready', function () {
            if (settings.container)
                LoadTmpl();
        });

        self.AddEvent('RGoods.onload.tmpl_' + settings.uniq, function (data) {
            var query = settings.start + '/' + settings.count + '/' + settings.orderBy;
            self.BaseLoad.RelatedGoods(settings.id, query, function (data) {
                CheckData(data);
            })
        });

        self.AddEvent('RGoods.fill.block_' + settings.uniq, function (data) {
            Render(data);
        });
        self.AddEvent('w.change.route', function () {
            settings.container = null;
        });
    }

    function InsertContainerEmptyWidget() {
        $(settings.container).html();
    }

    function InsertContainerContent(type) {
        if (type == 'slider')
            $(settings.container).html($('script#' + self.GetTmplName1(settings, 'slider')).html());
        if (type == 'carousel')
            $(settings.container).html($('script#' + self.GetTmplName1(settings, 'carousel')).html());
        if (type == 'tile')
            $(settings.container).html($('script#' + self.GetTmplName1(settings, 'tile')).html());
        if (type == 'table')
            $(settings.container).html($('script#' + self.GetTmplName1(settings, 'table')).html());
        if (type == 'list')
            $(settings.container).html($('script#' + self.GetTmplName1(settings, 'list')).html());
        if (type == 'empty')
            $(settings.container).html('');
    }

    function CheckData(data) {
        if (!data.err) {
            InsertContainerContent(settings.typeView);
            Fill(settings, data)
        }
        else {
            InsertContainerContent('empty');
        }
    }

    function Fill(settings, data) {
        var related = new RelatedGoodsViewModel(settings, data);
        related.AddContent();
    }

    function Render(data) {
        try {
            ko.cleanNode($(settings.container).children()[0]);
            ko.applyBindings(data, $(settings.container).children()[0]);
            if (settings.animate)
                settings.animate();
        }
        catch (e) {
            self.Exception('Ошибка шаблона [' + self.GetTmplName1(settings, data.typeView) + ']', e);
            if (settings.tmpl.custom) {
                delete settings.tmpl.custom;
                self.BaseLoad.Tmpl(settings.tmpl, function () {
                    InsertContainerContent(data.typeView);
                    Render(data);
                });
            }
            else {
                InsertContainerEmptyWidget();
            }
        }
    }
}

var RelatedGoodsViewModel = function (settings, data) {
    var self = this;
    self.typeView = settings.typeView;
    self.countGoods = settings.count;
    self.countTile = settings.countTile;
    self.content = ko.observableArray();
    self.cssBlockContainer = 'relatedGoodsContainer_';

    self.AddContent = function () {
        if (data && data.length >= 1) {
            var first = data.shift()
            self.countGoods = first.count_goods;

            if (data.length < self.countGoods)
                self.countGoods = data.length;

            var f = 0;
            for (var i = 0; i <= self.countGoods - 1; i++) {
                if (self.typeView == 'tile') {
                    var str = new BlockTrForTableViewModel();
                    for (var j = 0; j <= self.countTile - 1; j++) {
                        if (data[f]) {
                            str.AddStr(new ContentViewModel(data[f], f));
                            f++;
                        }
                        else
                            break;
                    }
                    if (str.str().length > 0)
                        self.content.push(str);
                    delete str;
                }
                else {
                    self.content.push(new ContentViewModel(data[i], i));
                }
            }
            self.cssBlockContainer = self.cssBlockContainer + EventDispatcher.HashCode(data.toString());
            data.unshift(first);
        }
        EventDispatcher.DispatchEvent('RGoods.fill.block_' + settings.uniq, self);
    }
}


