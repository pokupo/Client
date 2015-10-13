var Config = {
    Base: {
        sortingBlockContainer: '.sortingBlock', // id раскрывающегося списка сортировки товаров
        containerIdForTmpl: "container_tmpl", // id контейнера в который будут загружены все шаблоны
        loading: "https://promodev.pokupo.ru/images/loader_32px.gif", // иконка загрузчика
        title: 'Pokupo', // заголовок страницы по умолчанию
        cookie: {
            previously_viewed: 'previously_viewed',  // id просмотренных товаров
            userEmail: 'user_email',
            orderId: 'order_id'
        },
        containerIdErrorWindow: 'dialogErrorMessage', // id модального окна с ошибкой
        conteinerIdTextErrorWindow: 'containerError', // id контейнера для текста ошибки
        errorWindow: '<div id="dialogErrorMessage" title="Ошибка" style="display:none"><p id="containerError"></p></div>', // темплейт модального окна с ошибкой
        containerIdMessageWindow: 'dialogMessage', // id модального окна с сообщением
        conteinerIdTextMessageWindow: 'containerMessage', // id контейнера для текста сообщением
        containerMessage: '<div id="dialogMessage" title="Сообщение" style="display:none"><p id="containerMessage"></p></div>', // темплейт модального окна с сообщением
        timeMessage: 3000, //время посе которого скрывать сообщение
        containerIdConfirmWindow: 'dialogConfirm', // id модального окна с предупреждением
        conteinerIdTextConfirmWindow: 'containerConfirm', // id контейнера для текста с предупреждением
        containerConfirm: '<div id="dialogConfirm" title="Подтвердите действие" style="display:none"><p id="containerConfirm"></p></div>', // темплейт модального окна с сообщением
        sourceParameters: 'object', // источник параметров (строка подключения скрипта 'string' или обьект 'object')
        showCustomBlockOnDefault: false,
        toStringMonth: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Декабря']
    },
    Containers: {
        catalog: {}, // id контейнера каталога
        search: {}, // id контейнера формы поиска
        breadCrumb: {}, // id контейнеров хлебных крошек
        content: {}, // id контейнера контента
        searchResult: {}, // id контейнеров расширенной формы и результатов поиска
        goods: {}, // id контейнера информации о товаре
        standaloneGoods: {}, // id контейнера информации о товаре
        userInformation: {}, // id контейнера информации о пользователе
        authentication: {}, //id контейнеров авторизации
        registration: {}, // id контейнера регистрации
        registrationSeller: {}, // id контейнера регистрации продавца
        cart: {}, // id контейнера корзины
        cartGoods: {}, // id контейнера реестра товаров корзины
        cabinetCartGoods: {},
        profile: {}, // id контейнера меню профиля и содержимого
        menuPersonalCabinet: {},
        favorites: {}, // id контейнера избранного
        order: {}, // id конетейнера оформления заказа
        orderList: {}, // id конетейнера списка заказов
        buttonPayment: {}, // id контейнера страницы оплаты
        standalonePayment: {}, // id контейнера страницы оплаты
        statusPayment: {},
        shopInfo: {},
        message: {} // id контейнера списка сообщений
    },
    Paging: {
        currentPage: 1,
        itemsPerPage: 20,
        numDisplayEntries: 3,
        numEdgeEntries: 3,
        prevText: ' ',
        nextText: ' ',
        ellipseText: '...',
        prevShowAlways: false,
        nextShowAlways: false,
        cssCurrent: 'curent',
        cssItem: 'item_li',
        cssPrev: 'first',
        cssNext: 'last',
        startContent: 0
    }
};


