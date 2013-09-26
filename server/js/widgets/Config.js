var Config = {
    Base : {
        hostApi : "http://dev.pokupo.ru", // урл API
        httpsHostApi : "https://dev.pokupo.ru",
        catalogPathApi : "/api/catalog/", // префикс API каталога 
        goodsPathApi : "/api/goods/", // префикс API товаров
        userPathApi : "/api/user/", // префикс API пользователя
        cartPathApi : "/api/cart/", // префикс API корзины
        favPathApi : "/api/fav/", // префикс API избранное
        geoPathApi : "/api/geo/", // префикс API гео локации
        shopPathApi : "/api/shop/", // префикс API магазина
        orderPathApi : "/api/order/", // префикс API заказов
        pathToImages : "http://dev.pokupo.ru/images", // путь к папке с изображениями
        routIconAuction : "http://dev.pokupo.ru/images/ico_30.png", // иконка аукциона
        sortingBlockContainer : '.sortingBlock', // id раскрывающегося списка сортировки товаров
        containerIdForTmpl : "container_tmpl", // id контейнера в который будут загружены все шаблоны
        loading : "/loading50.gif", // иконка загрузщика
        title : 'Pokupo', // заголовок страницы по умолчанию
        cookie : {
           previously_viewed : 'previously_viewed'  // id просмотренных товаров
        },
        containerIdErrorWindow : 'dialogErrorMessage', // id модального окна с ошибкой
        conteinerIdTextErrorWindow: 'containerError', // id контейнера для текста ошибки
        errorWindow : '<div id="dialogErrorMessage" title="Ошибка" style="display:none"><p id="containerError"></p></div>', // темплейт модального окна с ошибкой
        containerIdMessageWindow : 'dialogMessage', // id модального окна с сообщением
        conteinerIdTextMessageWindow: 'containerMessage', // id контейнера для текста сообщением
        containerMessage : '<div id="dialogMessage" title="Сообщение" style="display:none"><p id="containerMessage"></p></div>', // темплейт модального окна с сообщением
        timeMessage : 3000, //время посе которого скрывать сообщение
        containerIdConfirmWindow : 'dialogConfirm', // id модального окна с предупреждением
        conteinerIdTextConfirmWindow: 'containerConfirm', // id контейнера для текста с предупреждением
        containerConfirm : '<div id="dialogConfirm" title="Подтвердите действие" style="display:none"><p id="containerConfirm"></p></div>', // темплейт модального окна с сообщением
        sourceParameters : 'object' // источник параметров (строка подключения скрипта 'string' или обьект 'object')
    },
    Containers : {  
        catalog : 'catalog', // id контейнера каталога 
        search  : 'search_block', // id контейнера формы поиска 
        breadCrumbs : ['breadCrumb_1','breadCrumb_2'], // id контейнеров хлебных крошек
        content : 'content', // id контейнера контента
        block : 'block',
        searchResult : ['advanced_search', 'content'], // id контейнеров расширенной формы и результатов поиска
        goods : 'content', // id контейнера информации о товаре
        userInformation : 'user_information', // id контейнера информации о пользователе
        authentication : ['content', 'catalog'], //id контейнеров авторизации
        registration : 'content', // id контейнера регистрации
        cart : 'cart_information', // id контейнера корзины
        cartGoods : 'content', // id контейнера реестра товаров корзины
        profile : 'content', // id контейнера меню профиля и содержимого
        menuPersonalCabinet : 'profile_menu',
        favorites : 'content', // id контейнера избранного
        order : 'content' // id конетейнера оформления заказа
    },
    Goods : {
        tmpl: {
            path : "goods/goodsTmpl.html", // файл шаблона
            tmplId : "goodsTmpl" // id шаблона виджета карточки товара по умолчанию
        },
        showBlocks : ['main', 'description'], // блоки отображаемые по умолчанию
        moreBlocks : {
            description : 'Описание', // заголовок блока "Описание товара"
            shipping : 'Условия доставки', // заголовок блока "Условия доставки"
            opinion : 'Отзывы покупателей' // заголовок блока "Отзывы покупателей"
        },
        message : {
            maxIsReached : "Достигнут максимум" // сообщение о том что достигнут максимум при выборе кол-ва товара
        },
        share : {
            element: 'share',  // id блока в котором будут размещены ссылки на соц сети
            elementStyle: {
                'quickServices': ['vkontakte', 'odnoklassniki', 'facebook', 'twitter', 'gplus'] // массив подключаемых соц сетей в формате http://api.yandex.ru/share/
            }
        },
        galleryId : "jcarousel", // id галереи
        style : { // стиль блока
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    Catalog : {
        tmpl : {
            path : "catalog/catalogTmpl.html", // путь к шаблонам
            mainPath : "content/mainTmpl.html", // путь к шаблонам
            tmplId : "catalogTmpl", // id шаблона виджета каталога по умолчанию
            blockMainTmplId : 'blockMainTmpl'
        },
        style : { // стиль блока
            'position' : 'absolute', 
            'top' : '100px', 
            'left' : '5%', 
            'width' : '20%', 
            'height' : '200px', 
            'background' : '#ddd'
        }
    },
    BreadCrumbs : {
        tmpl: {
            path : "breadCrumb/breadCrumbTmpl.html", // путь к шаблонам
            tmplId : "breadCrumbTmpl", // id шаблона виджета хлебных крошек по умолчанию
            tmplSelectListId : "breadCrumbSelectListTmpl" // id шаблона выпадающего списка
        },
        style : { // стиль блока
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
            noGoods : 'В этом разделе товаров не найдено...', // cообщение в случае если в разделе нет товаров
            filter : 'Товаров по ключу "%%filterName%%" не найдено' // сообщение в случае отсутствия товаров после фильтрации
        },
        tmpl: {
            mainPath : "content/mainTmpl.html", // путь к шаблонам
            pathBlock : "content/blockTmpl.html", // файл шаблона промо блоков
            pathList : "content/contentTmpl.html", // файл шаблона реестра товаров
            blockMainTmpl : "blockMainTmpl",
            blockSliderTmpl : "blockSliderTmpl", // id шаблона слайдера (промо)
            blockCaruselTmpl : "blockCaruselTmpl", // id шаблона карусели (промо)
            blockTileTmpl : "blockTileTmpl", // id шаблона плитки (промо)
            contentTableTmpl : "contentTableTmpl", // id шаблона таблицы
            contentListTmpl : "contentListTmpl", // id шаблона списка
            contentTileTmpl : "contentTileTmpl", // id шаблона плитки
            noResultsTmpl : "contentNoResultsTmpl" // id шаблона товаров не найдено
        },
        countGoodsInBlock : 6,  // кол-во товаров выводимых в блоке по умолчанию
        listPerPage : [10, 20, 50], // массив списка фильтра кол-ва товаров на странице
        sortList : [{name: 'rating', title: 'рейтингу'}, {name: 'name', title: 'названию'}, {name: 'cost', title: 'цене'}],
        orderBy : 'name', // сортировка по умолчанию
        style : { // стиль блока 
            'position' : 'absolute', 
            'top' : '50px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '600px', 
            'background' : '#ddd'
        }
    },
    Search : {
        tmpl : {
            path : "search/searchTmpl.html", // путь к шаблонам
            tmplId : "searchTmpl" // id шаблона формы поиска по умолчанию
        },
        message : {
             empty : 'Введите название товара для его поиска.'
        },
        style : {// стиль блока
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    SearchResult : {
        tmpl: {
            path : "searchResult/advancedSearchFormTmpl.html", // файл шаблонов расширенной формы и результатов поиска
            advancedSearchFormTmpl : "advancedSearchFormTmpl", // id шаблона расширенной формы
            contentTableTmpl : "searchResultTableTmpl", // id шаблона таблицы
            contentListTmpl : "searchResultListTmpl", // id шаблона списка
            contentTileTmpl : "searchResultTileTmpl", // id шаблона плитки
            noResultsTmpl : "searchResultErrorTmpl" // id шаблона товаров не найдено
        },
        idAdvancedSearchForm : "advancedSearch", // id расширенной формы
        listPerPage : [10, 20, 50], // массив списка фильтра кол-ва товаров на странице
        sortList : [{name: 'rating', title: 'рейтингу'}, {name: 'name', title: 'названию'}, {name: 'cost', title: 'цене'}],
        listTypeSearch : { // тип поиска 
            any : 'Любое из слов',
            all : 'Все слова'
        },
        listTypeSeller : { // тип продавцов
            '' : "Все продавцы",
            person : 'Частное лицо',
            company : 'Компания'
        },
        style : {// стиль блока
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    RelatedGoods : {
        tmpl:{
            path : "relatedGoods/relatedGoodsTmpl.html", // файл шаблонов связанных товаров
            contentTableTmpl : "relatedGoodsTableTmpl", // id шаблона таблицы
            contentListTmpl : "relatedGoodsListTmpl", // id шаблона списка
            contentTileTmpl : "relatedGoodsTileTmpl", // id шаблона плитки
            contentSliderTmpl : "relatedGoodsSliderTmpl", // id шаблона слайдера
            contentCaruselTmpl : "relatedGoodsCaruselTmpl" // id шаблона карусели
        },
        countGoodsInBlock : 6, // максимальное кол-во товаров в блоке
        countGoodsTileInStr : 5, // кол-во плиток в строке 
        orderBy : 'rating', // сортировка
        start : 0, // начальная позиция в запросе
        typeView : 'carousel' // тип отображения по умолчанию
    },
    InfoSeller : {
        tmpl: {
            tmplId : "infoSellerTmpl", // id шаблона информации о продавце
            path : "infoSeller/infoSellerTmpl.html" // файл шаблона информации о продавце
        }
    },
    UserInformation : {
        tmpl : {
            path : "userInformation/userInformationTmpl.html", // файл шаблонов
            infoTmplId : "userInformationTmpl", //id шаблона вывода информации о пользователе
            authTmplId : "authorizationLinkTmpl" //id шаблона с сылками войти/регистрация
        },
        showBlocks : ['login'], 
        style : {// стиль блока
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    Authentication : {
        https : "always", // always, never, login
        tmpl : {
            path : "authentication/authenticationTmpl.html", // файл шаблонов
            authFormTmplId : "authenticationFormTmpl" //id шаблона формы авторизации
        },
        message : {
            pleaseLogIn : 'Необходимо авторизоваться.',
            confirmLogOut : 'Вы действительно хотите выйти?'
        },
        style : {// стиль блока
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    Registration : {
        tmpl : {
            path : "registration/registrationTmpl.html", // файл шаблонов
            regFormStep1TmplId : "registrationFromStep1Tmpl", //id шаблона формы регистрации шаг 1
            regFormStep2TmplId : "registrationFromStep2Tmpl", //id шаблона формы регистрации шаг 2
            regFormStep3TmplId : "registrationFromStep3Tmpl", //id шаблона формы регистрации шаг 3
            regFormStep4TmplId : "registrationFromStep4Tmpl", //id шаблона формы регистрации шаг 4
        },
        regular : { // регулярные выражения полей
            username : /^[а-яёa-zА-ЯЁA-Z0-9_\-\.\s]+$/,
            email : /^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/,
            phone : /^([\d]{1})\s([\d]{3})\s([\d]{3})\s([\d]{2})\s([\d]{2})(\s([\d]{2}))?$/,
            firstName : /^[a-zёа-яА-ЯЁA-Z]+$/,
            lastName : /^[a-zа-яёА-ЯЁA-Z]+$/,
            middleName : /^[a-zа-яёА-ЯЁA-Z]+$/,
            birthDay : /^[\d]{2}.[\d]{2}.[\d]{4}$/,
            gender : /^[mw]$/
        },
        error : { // сообщения об ошибках при валидации формы регистрации
            username : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 4 символа',
                maxLength : 'Максимум 40 символов',
                regular : 'Только буквы латинского или русского алфавита',
                uniq: 'К сожалению это имя уже занято, попробуйте указать другой вариант'
            },
            email : {
                empty : 'Поле обязательно для заполнения',
                maxLength : 'Максимум 64 символа',
                regular : 'Строка не является адресом электронной почты',
                uniq : 'Аккаунт для этого почтового ящика уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
            },
            phone : {
                regular : 'Не верный формат телефона',
                uniq : 'Аккаунт для этого номера телефона уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
            },
            password : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Пароль должен быть не менее 6 символов',
                maxLength : 'Пароль должен быть не более 64 символов',
                equal : 'Пароль не совпадает с образцом' 
            },
            isChecked : {
                empty : 'Вам необходимо прочитать и принять условия соглашения'
            },
            emailToken : {
                empty : 'Поле обязательно для заполнения',
                confirm : 'Указанный код не принят системой'
            },
            phoneToken : {
                empty : 'Поле обязательно для заполнения',
                confirm : 'Указанный код не принят системой'
            },
            confirmLater : {
                empty : 'Для активации аккаунта требуется подтвердить хотя бы один из способов связи',
            },
            firstName : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 2 символа',
                maxLength : 'Максимум 20 символов',
                regular : 'Только буквы латинского или русского алфавита'
            },
            lastName : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 2 символа',
                maxLength : 'Максимум 20 символов',
                regular : 'Только буквы латинского или русского алфавита'
            },
            middleName : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 2 символа',
                maxLength : 'Максимум 20 символов',
                regular : 'Только буквы латинского или русского алфавита'
            },
            birthDay : {
                empty : 'Поле обязательно для заполнения',
                minDate : 'Возраст пользователя должен быть не менее 18 лет.',
                maxDate : 'Возраст пользователя может быть не старше 101 года'
            },
            gender : {
                empty : 'Поле обязательно для заполнения'
            },
            country : {
                empty : 'Поле обязательно для заполнения'
            },
            region : {
                empty : 'Поле обязательно для заполнения'
            },
            city : {
                empty : 'Поле обязательно для заполнения'
            },
            address : {
                empty : 'Поле обязательно для заполнения'
            },
            postIndex : {
                empty : 'Поле обязательно для заполнения'
            }
        },
        style : {// стиль блока
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    MenuPersonalCabinet : {
        tmpl : {
            path : "menuPersonalCabinet/menuPersonalCabinetTmpl.html", // файл шаблонов
            menuPersonalCabinet : 'menuPersonalCabinetTmpl', // id шаблона меню личного кабинета
        },
        style : {// стиль блока
            'position' : 'relative', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    Profile : {
        tmpl : {
            path : "profile/profileTmpl.html", // файл шаблонов
            personalInformationTmpl : "personalInformationTmpl", //id шаблона формы персоональных данных
            deliveryAddressTmpl : "deliveryAddressTmpl", //id шаблона списка адресов доставки
            deliveryAddressFormTmpl : "deliveryAddressFormTmpl", //id шаблона формы адресов доставки
            securityTmpl : "securityTmpl" //id шаблона формы смены пароля
        },
        menu : {
            personalInformation : {title : 'Персональные данные', prefix : 'personal'},
            deliveryAddress : {title : 'Адреса доставки', prefix : 'delivery'},
            security : {title : 'Безопасность', prefix : 'security'}
        },
        regular : { // регулярные выражения полей
            email : /^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/,
            phone : /^([\d]{1})\s([\d]{3})\s([\d]{3})\s([\d]{2})\s([\d]{2})(\s([\d]{2}))?$/,
            firstName : /^[a-zёа-яА-ЯЁA-Z]+$/,
            lastName : /^[a-zа-яёА-ЯЁA-Z]+$/,
            middleName : /^[a-zа-яёА-ЯЁA-Z]+$/,
            birthDay : /^[\d]{2}.[\d]{2}.[\d]{4}$/,
            addressee : /^[a-zа-яёА-ЯЁA-Z\s]+$/
        },
        message : {
            sendToken : 'Код активации успешно выслан по указанным данным.',
            failSendToken : 'Код не был отправлен. Попробуйте повторить запрос позднее.',
            contactsEdit : 'Данные успешно обновлены',
            failContactsEdit : 'Данные не обновлены. Попробуйте повторить запрос позднее.',
            editProfile : 'Данные успешно обновлены',
            failEditProfile : 'Данные не обновлены. Попробуйте повторить запрос позднее.',
            changePassword: 'Пароль успешно изменен.',
            failChangePassord : 'Пароль не изменен.',
            addAddressDelivery : 'Данные успешно сохранены.',
            failAddAddressDelivery : 'Данные не сохранены. Попробуйте повторить запрос позднее.',
            deleteAddressDelivery : 'Адрес доставки успешно удален.',
            confirmDeleteAddressDelivery : "Вы уверены, что хотите удалить адрес?",
            failDeleteAddressDelivery : 'Адрес доставки не удален. Попробуйте повторить запрос позднее.',
            setDefaultDelivery : 'Данные успешно обновлены.',
            failSetDefaultDelivery : 'Данные не обновлены.'
        },
        error : { // сообщения об ошибках при валидации формы регистрации
            email : {
                empty : 'Поле обязательно для заполнения',
                maxLength : 'Максимум 64 символа',
                regular : 'Строка не является адресом электронной почты',
                uniq : 'Аккаунт для этого почтового ящика уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
            },
            phone : {
                empty : 'Поле обязательно для заполнения',
                regular : 'Не верный формат телефона',
                uniq : 'Аккаунт для этого номера телефона уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
            },
            password : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Пароль должен быть не менее 6 символов',
                maxLength : 'Пароль должен быть не более 64 символов',
                equal : 'Пароль не совпадает с образцом' 
            },
            emailToken : {
                empty : 'Поле обязательно для заполнения',
                confirm : 'Указанный код не принят системой'
            },
            phoneToken : {
                empty : 'Поле обязательно для заполнения',
                confirm : 'Указанный код не принят системой'
            },
            addressee : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 2 символа',
                maxLength : 'Максимум 20 символов',
                regular : 'Только буквы латинского или русского алфавита'
            },
            firstName : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 2 символа',
                maxLength : 'Максимум 20 символов',
                regular : 'Только буквы латинского или русского алфавита'
            },
            lastName : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 2 символа',
                maxLength : 'Максимум 20 символов',
                regular : 'Только буквы латинского или русского алфавита'
            },
            middleName : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 2 символа',
                maxLength : 'Максимум 20 символов',
                regular : 'Только буквы латинского или русского алфавита'
            },
            birthDay : {
                empty : 'Поле обязательно для заполнения',
                minDate : 'Возраст пользователя должен быть не менее 18 лет.',
                maxDate : 'Возраст пользователя может быть не старше 101 года'
            },
            country : {
                empty : 'Поле обязательно для заполнения'
            },
            region : {
                empty : 'Поле обязательно для заполнения'
            },
            city : {
                empty : 'Поле обязательно для заполнения'
            },
            address : {
                empty : 'Поле обязательно для заполнения'
            },
            postIndex : {
                empty : 'Поле обязательно для заполнения'
            }
        },
        style : {// стиль блока
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    Cart : {
        cartId : 'cart', // id корзины товара
        title : 'Корзина', // заголовок блока
        showBlocks : {
            title : 'never', // показывать название «Корзина» - всегда(always)/никогда(never)/когда пустая(empty)
            count : false, // отображать кол-во товара
            baseCost : false, // отображать сумму без скидок
            finalCost : false // отображать конечную сумму
        },
        tmpl : {
            path : "cart/cartTmpl.html", // файл шаблонов
            tmplId : "cartTmpl", //id шаблона формы авторизации
        },
        style : {// стиль блока
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    CartGoods : {
        title : 'Моя корзина',
        tmpl : {
            path : "cartGoods/cartGoodsTmpl.html", // файл шаблонов
            cartTmplId : "cartGoodsTmpl", //id шаблона формы авторизации
            emptyCartTmplId : "emptyCartGoodsTmpl"
        },
        message :{
            addFavorites : 'Выбранные товары добавлены в избранное.',
            failAddFavorites : 'Произошла ошибка при добавлении товара в избранное. Попробуйте еще раз.'
        }, 
        style : {// стиль блока
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    CabinetCartGoods : {
        title : 'Моя корзина',
        tmpl : {
            path : "cabinetCartGoods/cabinetCartGoodsTmpl.html", // файл шаблонов
            cartTmplId : "cabinetCartGoodsTmpl", //id шаблона формы авторизации
            emptyCartTmplId : "emptyCabinetCartGoodsTmpl"
        },
        message :{
            addFavorites : 'Выбранные товары добавлены в избранное.',
            failAddFavorites : 'Произошла ошибка при добавлении товара в избранное. Попробуйте еще раз.'
        }, 
        style : {// стиль блока
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    Favorites : {
        title : 'Избранное',
        tmpl : {
            path : "favorites/favoritesTmpl.html", // файл шаблонов
            cartTmplId : "favoritesTmpl", //id шаблона формы авторизации
            emptyCartTmplId : "emptyFavoritesTmpl"
        },
        showBlocks : ['infoShop','addToCart','buy'],
        message :{
            clearGoods : 'Выбранные товары удалены из избранного.',
            failClearGoods : 'Произошла ошибка при удалении товара из избранного. Попробуйте еще раз.'
        }, 
        style : {// стиль блока
            'position' : 'absolute', 
            'top' : '0px', 
            'left' : '5%', 
            'width' : '100%', 
            'height' : '50px', 
            'background' : '#ddd'
        }
    },
    Order : {
        tmpl : {
            path : "order/orderTmpl.html", // файл шаблонов
            ordFormStep1TmplId : "orderFormStep1Tmpl", //id шаблона формы заказа шаг 1
            ordConfirmFormStep1TmplId : "orderConfirmFormStep1Tmpl", //id шаблона формы активации аккаунта при заказе шаг 1
            ordProfileFormStep1TmplId : 'orderProfileFormStep1Tmpl', // id шаблона формы персоональных данных
            ordFormStep3TmplId : "orderFormStep3Tmpl", //id шаблона формы заказа шаг 3
            ordFormStep2TmplId : "orderFormStep2Tmpl", //id шаблона формы заказа шаг 2
            ordDeliveryFormStep2TmplId : 'orderDeliveryFormStep2Tmpl',
            ordFormStep4TmplId : "orderFormStep4Tmpl", //id шаблона формы заказа шаг 4
            ordFormStep5TmplId : "orderFormStep5Tmpl", //id шаблона формы заказа шаг 5
        },
        regular : { // регулярные выражения полей
            username : /^[а-яёa-zА-ЯЁA-Z0-9_\-\.\s]+$/,
            email : /^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/,
            phone : /^([\d]{1})\s([\d]{3})\s([\d]{3})\s([\d]{2})\s([\d]{2})(\s([\d]{2}))?$/,
            firstName : /^[a-zёа-яА-ЯЁA-Z]+$/,
            lastName : /^[a-zа-яёА-ЯЁA-Z]+$/,
            middleName : /^[a-zа-яёА-ЯЁA-Z]+$/,
            birthDay : /^[\d]{2}.[\d]{2}.[\d]{4}$/,
            gender : /^[mw]$/,
            addressee : /^[a-zа-яёА-ЯЁA-Z\s]+$/
        },
        message : {
            addAddressDelivery : 'Данные успешно сохранены.',
            failAddAddressDelivery : 'Данные не сохранены. Попробуйте повторить запрос позднее.',
            deleteAddressDelivery : 'Адрес доставки успешно удален.',
            confirmDeleteAddressDelivery : "Вы уверены, что хотите удалить адрес?",
            failDeleteAddressDelivery : 'Адрес доставки не удален. Попробуйте повторить запрос позднее.',
            setDefaultDelivery : 'Данные успешно обновлены.',
            failSetDefaultDelivery : 'Данные не обновлены.',
            orderConfirm : 'Ваш заказ подтвержден.',
            selectMethodPayment : 'Необходимо выбрать способ оплаты.',
            selectAddress : 'Необходимо выбрать метод доставки.',
            selectMethodShipping : 'Необходимо выбрать метод доставки.',
            confirmDeleteOrder : 'Вы уверны, что хотите удалить заказ?',
            deleteOrderConfirm : 'Ваш заказ удален.'
        },
        error : { // сообщения об ошибках при валидации формы регистрации
            username : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 4 символа',
                maxLength : 'Максимум 40 символов',
                regular : 'Только буквы латинского или русского алфавита',
                uniq: 'К сожалению это имя уже занято, попробуйте указать другой вариант'
            },
            email : {
                empty : 'Поле обязательно для заполнения',
                maxLength : 'Максимум 64 символа',
                regular : 'Строка не является адресом электронной почты',
                uniq : 'Аккаунт для этого почтового ящика уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
            },
            phone : {
                empty : 'Поле обязательно для заполнения',
                regular : 'Не верный формат телефона',
                uniq : 'Аккаунт для этого номера телефона уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
            },
            password : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Пароль должен быть не менее 6 символов',
                maxLength : 'Пароль должен быть не более 64 символов',
                equal : 'Пароль не совпадает с образцом' 
            },
            isChecked : {
                empty : 'Вам необходимо прочитать и принять условия соглашения'
            },
            emailToken : {
                empty : 'Поле обязательно для заполнения',
                confirm : 'Указанный код не принят системой'
            },
            phoneToken : {
                empty : 'Поле обязательно для заполнения',
                confirm : 'Указанный код не принят системой'
            },
            confirmLater : {
                empty : 'Для активации аккаунта требуется подтвердить хотя бы один из способов связи',
            },
            firstName : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 2 символа',
                maxLength : 'Максимум 20 символов',
                regular : 'Только буквы латинского или русского алфавита'
            },
            lastName : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 2 символа',
                maxLength : 'Максимум 20 символов',
                regular : 'Только буквы латинского или русского алфавита'
            },
            middleName : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 2 символа',
                maxLength : 'Максимум 20 символов',
                regular : 'Только буквы латинского или русского алфавита'
            },
            birthDay : {
                empty : 'Поле обязательно для заполнения',
                minDate : 'Возраст пользователя должен быть не менее 18 лет.',
                maxDate : 'Возраст пользователя может быть не старше 101 года'
            },
            gender : {
                empty : 'Поле обязательно для заполнения'
            },
            country : {
                empty : 'Поле обязательно для заполнения'
            },
            region : {
                empty : 'Поле обязательно для заполнения'
            },
            city : {
                empty : 'Поле обязательно для заполнения'
            },
            address : {
                empty : 'Поле обязательно для заполнения'
            },
            postIndex : {
                empty : 'Поле обязательно для заполнения'
            },
            addressee : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 2 символа',
                maxLength : 'Максимум 20 символов',
                regular : 'Только буквы латинского или русского алфавита'
            },
        },
        style : {// стиль блока
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
};


