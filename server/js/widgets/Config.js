var Config = {
    Base : {
        pathToImages : "http://dev.pokupo.ru/images",
        routIconAuction : "http://dev.pokupo.ru/images/ico_30.png",
        sortingBlockContainer : '.sorting_block',
        containerIdForTmpl : "container_tmpl",
        loading : "/loading50.gif"
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
            all : 'Все слова',
            any: 'Любое из слов'
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


