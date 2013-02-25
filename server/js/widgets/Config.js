var Config = {
    Base : {
        hostApi : "http://dev.pokupo.ru/app_dev.php",
        catalogPathApi : "/api/catalog/",
        goodsPathApi : "/api/goods/",
        pathToImages : "http://dev.pokupo.ru/images",
        routIconAuction : "http://dev.pokupo.ru/images/ico_30.png",
        sortingBlockContainer : '.sorting_block',
        containerIdForTmpl : "container_tmpl",
        loading : "/loading50.gif",
        title : 'Pokupo',
        cookie : {
           previously_viewed : 'previously_viewed'  // id просмотренных товаров
        }
    },
    Containers : {
        catalog : 'catalog',
        search  : 'search_block',
        breadCrumbs : ['breadCrumb_1','breadCrumb_2'],
        content : 'content',
        searchResult : ['advanced_search', 'content'],
        goods : 'content'
    },
    Goods : {
        tmplId : "goodsTmpl",
        tmplPath : "goods/",
        showBlocks : ['main', 'description'],
        moreBlocks : {
            description : 'Описание',
            shipping : 'Условия доставки',
            opinion : 'Отзывы покупателей'
        },
        message : {
            maxIsReached : "Достигнут максисум"
        },
        share : {
            element: 'share',  // id блока в котором будут размещены ссылки на соц сети
            elementStyle: {
                'quickServices': ['vkontakte', 'odnoklassniki', 'facebook', 'twitter', 'gplus']
            }
        },
        galleryId : "jcarousel",
        style : {
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    Catalog : {
        tmpl : "catalog/catalogTmpl.html",
        style : {
            'position' : 'absolute', 
            'top' : '100px', 
            'left' : '5%', 
            'width' : '20%', 
            'height' : '200px', 
            'background' : '#ddd'
        }
    },
    BreadCrumbs : {
        tmpl : "breadCrumb/breadCrumbTmpl.html",
        style : {
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    Content : {
        message : {
            noGoods : 'В этом разделе товаров не найдено...',
            filter : 'Товаров по ключу "%%filterName%%" не найдено'
        },
        tmplForBlock : "content/blockTmpl.html",
        tmplForContent : "content/contentTmpl.html",
        countGoodsInBlock : 6,
        listPerPage : [10, 20, 50],
        orderBy : 'name',
        style : {
            'position' : 'absolute', 
            'top' : '50px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '600px', 
            'background' : '#ddd'
        }
    },
    Search : {
        tmpl : "search/searchTmpl.html",
        style : {
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    SearchResult : {
        tmpl: "searchResult/advancedSearchFormTmpl.html",
        listPerPage : [10, 20, 50],
        listTypeSearch : {
            any : 'Любое из слов',
            all : 'Все слова'
        },
        listTypeSeller : {
            '' : "Все продавцы",
            person : 'Частное лицо',
            company : 'Компания'
        },
        style : {
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    RelatedGoods : {
        tmplId : "relatedGoodsTmpl",
        tmplPath : "relatedGoods/",
        countGoodsInBlock : 6,
        countGoodsTileInStr : 5,
        orderBy : 'rating',
        start : 0,
        typeView : 'slider',
        style : {
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    InfoSeller : {
        tmplId : "infoSellerTmpl",
        tmplPath : "infoSeller/",
        style : {
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    Cart : {
        cartId : 'cart'
    },
    Paging : {
        currentPage : 1,
        itemsPerPage : 20,
        numDisplayEntries : 3,
        numEdgeEntries : 3,
        prevText : ' ',
        nextText : ' ',
        ellipseText : '...',
        prevShowAlways :false,
        nextShowAlways :false,
        cssCurrent : 'curent',
        cssItem : 'item_li',
        cssPrev : 'first',
        cssNext : 'last',
        startContent : 0
    }
}


