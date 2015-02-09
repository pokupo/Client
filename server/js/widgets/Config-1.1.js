var Config = {
    Base : {
        sortingBlockContainer : '.sortingBlock', // id раскрывающегося списка сортировки товаров
        containerIdForTmpl : "container_tmpl", // id контейнера в который будут загружены все шаблоны
        loading : "http://seller.pokupo.ru/images/loading50.gif", // иконка загрузчика
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
        sourceParameters : 'object', // источник параметров (строка подключения скрипта 'string' или обьект 'object')
        showCustomBlockOnDefault : false,
        toStringMonth : ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Декабря']
    },
    Containers : {  
        catalog : {widget: 'catalog', def: 'default_catalog', customClass: 'custom_block'}, // id контейнера каталога 
        search  : {widget: 'search_block', def: 'default_search_block', customClass: 'custom_block'}, // id контейнера формы поиска 
        breadCrumb : {widget: ['breadCrumb_1','breadCrumb_2'], def: ['default_breadCrumb_1','default_breadCrumb_2'], customClass: ['custom_block_1, custom_block_2']}, // id контейнеров хлебных крошек
        content : {
            content : {widget: 'content', def: 'default_content', customClass: 'custom_block'}, 
            block: {
                slider: {widget: 'slider_block', def: 'slider_default_block', customClass: 'slider_custom_block'},
                carousel: {widget: 'carousel_block', def: 'carousel_default_block', customClass: 'carousel_custom_block'},
                tile: {widget: 'tile_block', def: 'tile_default_block', customClass: 'tile_custom_block'},
                empty: {widget: 'content', def: 'default_content', customClass: 'custom_block'}
            }
        }, // id контейнера контента
        searchResult : {
            form: {widget: 'advanced_search', def: 'default_advanced_search', customClass: 'custom_block'},
            content:{widget: 'content', def: 'default_content', customClass: 'custom_block'}
        }, // id контейнеров расширенной формы и результатов поиска
        goods : {widget: 'content', def: 'default_content', customClass: 'custom_block'}, // id контейнера информации о товаре
        userInformation : {widget: 'user_information', def: 'default_user_information', customClass: 'custom_block'}, // id контейнера информации о пользователе
        authentication : {widget: 'content', def: 'default_content', customClass: 'custom_block'}, //id контейнеров авторизации
        registration : {widget: 'content', def: 'default_content', customClass: 'custom_block'}, // id контейнера регистрации
        registrationSeller : {widget: 'content', def: 'default_content', customClass: 'custom_block'}, // id контейнера регистрации продавца
        cart : {widget: 'cart_information', def: 'default_cart_information', customClass: 'custom_block'}, // id контейнера корзины
        cartGoods : {widget: 'content', def: 'default_content', customClass: 'custom_block'}, // id контейнера реестра товаров корзины
        cabinetCartGoods : {widget: 'content', def: 'default_content', customClass: 'custom_block'},
        profile : {widget: 'content', def: 'default_content', customClass: 'custom_block'}, // id контейнера меню профиля и содержимого
        menuPersonalCabinet : {widget: 'profile_menu', def: 'default_profile_menu', customClass: 'custom_block'},
        favorites : {widget: 'content', def: 'default_content', customClass: 'custom_block'}, // id контейнера избранного
        order : {widget: 'content', def: 'default_content', customClass: 'custom_block'}, // id конетейнера оформления заказа
        orderList : {widget: 'content', def: 'default_content', customClass: 'custom_block'}, // id конетейнера списка заказов
        buttonPayment : {widget: 'content', def: 'default_content', customClass: 'custom_block'}, // id контейнера страницы оплаты
        message : {widget: 'content', def: 'default_content', customClass: 'custom_block'} // id контейнера списка сообщений
    },
    Goods : {
        tmpl: {
            path : "goodsTmpl.html", // файл шаблона
            id : "goodsTmpl" // id шаблона виджета карточки товара по умолчанию
        },
        showBlocks : ['main', 'description'], // блоки отображаемые по умолчанию
        moreBlocks : {
            description : 'Описание', // заголовок блока "Описание товара"
            shipping : 'Условия доставки', // заголовок блока "Условия доставки"
            opinion : 'Отзывы покупателей' // заголовок блока "Отзывы покупателей"
        },
        message : {
            maxIsReached : "Достигнут максимум", // сообщение о том что достигнут максимум при выборе кол-ва товара
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
            path : "catalogTmpl.html", // путь к шаблонам
            id : "catalogTmpl" // id шаблона виджета каталога по умолчанию
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
    BreadCrumb : {
        tmpl: {
            path : "breadCrumbTmpl.html", // путь к шаблонам
            id : "breadCrumbTmpl", // id шаблона виджета хлебных крошек по умолчанию
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
            filter : 'Товаров по ключу "%%filterName%%" не найдено', // сообщение в случае отсутствия товаров после фильтрации
            categoriesNotCreated: 'Рубрикатор не создан.' //Рубрикатор не создан
        },
        tmpl: {
            content: {
                path : "content/contentTmpl.html", // файл шаблона реестра товаров 
                id: {
                    table : "contentTableTmpl", // id шаблона таблицы
                    list : "contentListTmpl", // id шаблона списка
                    tile : "contentTileTmpl", // id шаблона плитки
                    empty : "contentNoResultsTmpl" // id шаблона товаров не найдено
                }
            },
            block : {
                path : "content/blockTmpl.html", // файл шаблона промо блоков 
                id: {
                    slider : "blockSliderTmpl", // id шаблона слайдера (промо)
                    carusel : "blockCaruselTmpl", // id шаблона карусели (промо)
                    tile : "blockTileTmpl", // id шаблона плитки (промо)
                    empty : "blockNoResultsTmpl" // id шаблона товаров не найдено
                }
            }
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
            path : "searchTmpl.html", // путь к шаблонам
            id : "searchTmpl" // id шаблона формы поиска по умолчанию
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
            content : {
                path : "searchResultTmpl.html", // результатов поиска
                id : {
                    table : "searchResultTableTmpl", // id шаблона таблицы
                    list : "searchResultListTmpl", // id шаблона списка
                    tile : "searchResultTileTmpl", // id шаблона плитки
                    empty : "searchResultErrorTmpl" // id шаблона товаров не найдено
                }
            },
            form : {
                path : "searchResult/advancedSearchFormTmpl.html", // файл шаблонов расширенной формы
                id : "advancedSearchFormTmpl", // id шаблона расширенной формы
            }
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
            path : "relatedGoodsTmpl.html", // файл шаблонов связанных товаров
            id : {
                table : "relatedGoodsTableTmpl", // id шаблона таблицы
                list : "relatedGoodsListTmpl", // id шаблона списка
                tile : "relatedGoodsTileTmpl", // id шаблона плитки
                slider : "relatedGoodsSliderTmpl", // id шаблона слайдера
                carousel : "relatedGoodsCarouselTmpl" // id шаблона карусели
            }
        },
        count : 6, // максимальное кол-во товаров в блоке
        countTile : 5, // кол-во плиток в строке 
        orderBy : 'rating', // сортировка
        start : 0, // начальная позиция в запросе
        typeView : 'carousel' // тип отображения по умолчанию
    },
    InfoSeller : {
        tmpl: {
            id : "infoSellerTmpl", // id шаблона информации о продавце
            path : "infoSellerTmpl.html" // файл шаблона информации о продавце
        }
    },
    UserInformation : {
        tmpl : {
            path : "userInformationTmpl.html", // файл шаблонов
            id : {
                info : "userInformationTmpl", //id шаблона вывода информации о пользователе
                auth : "authorizationLinkTmpl" //id шаблона с сылками войти/регистрация
            } 
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
        https : "login", // always, never, login
        tmpl : {
            path : "authenticationTmpl.html", // файл шаблонов
            id : "authenticationFormTmpl" //id шаблона формы авторизации
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
            path : "registrationTmpl.html", // файл шаблонов
            id: {
                step1 : "registrationFromStep1Tmpl", //id шаблона формы регистрации шаг 1
                step2 : "registrationFromStep2Tmpl", //id шаблона формы регистрации шаг 2
                step3 : "registrationFromStep3Tmpl", //id шаблона формы регистрации шаг 3
                step4 : "registrationFromStep4Tmpl", //id шаблона формы регистрации шаг 4
            }
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
        message : {
            registrationSuccessful : "Вы успешно зарегистрировались в магазине"
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
                uniq : 'Аккаунт для этого почтового ящика уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="https://pokupo.ru/resetting/request">Восстановить доступ</a>'
            },
            phone : {
                regular : 'Не верный формат телефона',
                uniq : 'Аккаунт для этого номера телефона уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="https://pokupo.ru/resetting/request">Восстановить доступ</a>'
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
    RegistrationSeller : {
        tmpl : {
            path : "registrationSellerTmpl.html", // файл шаблонов
            id: {
                step1 : "registrationSellerFromStep1Tmpl", //id шаблона формы регистрации шаг 1
                step2 : "registrationSellerFromStep2Tmpl", //id шаблона формы регистрации шаг 2
                step3 : "registrationSellerFromStep3Tmpl",  //id шаблона формы регистрации шаг 3
                step4 : "registrationSellerFromStep4Tmpl"  //id шаблона формы регистрации шаг 4
            }
        },
        regular : { // регулярные выражения полей
            nameSeller : /^[а-яёa-zА-ЯЁA-Z0-9_\-\.\s]+$/,
            email : /^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/,
            phone : /^([\d]{1})\s([\d]{3})\s([\d]{3})\s([\d]{2})\s([\d]{2})(\s([\d]{2}))?$/
        },
        error : { // сообщения об ошибках при валидации формы регистрации
            nameSeller : {
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
                uniq : 'Аккаунт для этого почтового ящика уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="https://pokupo.ru/resetting/request">Восстановить доступ</a>'
            },
            phone : {
                regular : 'Не верный формат телефона',
                uniq : 'Аккаунт для этого номера телефона уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="https://pokupo.ru/resetting/request">Восстановить доступ</a>'
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
            typeSeller : {
                empty : 'Поле обязательно для заполнения',
                minLength : 'Минимум 5 символов',
                maxLength : 'Максимум 40 символов',
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
            path : "menuPersonalCabinetTmpl.html", // файл шаблонов
            id : 'menuPersonalCabinetTmpl', // id шаблона меню личного кабинета
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
            path : "profileTmpl.html", // файл шаблонов
            id: {
                personal : "personalInformationTmpl", //id шаблона формы персоональных данных
                delivery : "deliveryAddressTmpl", //id шаблона списка адресов доставки
                deliveryForm : "deliveryAddressFormTmpl", //id шаблона формы адресов доставки
                security : "securityTmpl" //id шаблона формы смены пароля
            }
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
            addressee : /^[a-zа-яёА-ЯЁA-Z\s]+$/,
            postIndex: /^[0-9]+$/
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
                empty : 'Поле обязательно для заполнения',
                length: 'В почтовом индексе должно быть 6 цифр',
                regular: 'Только цифры'
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
            title : 'always', // показывать название «Корзина» - всегда(always)/никогда(never)/когда пустая(empty)
            count : true, // отображать кол-во товара
            baseCost : true, // отображать сумму без скидок
            finalCost : true, // отображать конечную сумму
            fullInfo : true // отображать информацию по товарам
        },
        tmpl : {
            path : "cartTmpl.html", // файл шаблонов
            id : "cartTmpl", //id шаблона формы авторизации
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
            path : "cartGoodsTmpl.html", // файл шаблонов
            id : {
                content : "cartGoodsTmpl", //id шаблона формы авторизации
                empty : "emptyCartGoodsTmpl"
            }
        },
        message :{
            addFavorites : 'Выбранные товары добавлены в избранное.',
            failAddFavorites : 'Произошла ошибка при добавлении товара в избранное. Попробуйте еще раз.',
            confirmRemove : 'Вы уверены, что хотите удалить товар из корзины?',
            confirmClearCart : 'Вы уверены, что хотите очистить корзину?',
            confirmButchRemove : 'Вы уверены, что хотите удалить выбранный товар из корзины?'
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
            path : "cabinetCartGoodsTmpl.html", // файл шаблонов
            id : {
                content : "cabinetCartGoodsTmpl", //id шаблона формы авторизации
                empty : "emptyCabinetCartGoodsTmpl"
            }
        },
        message :{
            addFavorites : 'Выбранные товары добавлены в избранное.',
            failAddFavorites : 'Произошла ошибка при добавлении товара в избранное. Попробуйте еще раз.',
            confirmRemove : 'Вы уверены, что хотите удалить товар из корзины?',
            confirmClearCart : 'Вы уверены, что хотите очистить корзину?',
            confirmButchRemove : 'Вы уверены, что хотите удалить выбранный товар из корзины?'
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
            path : "favoritesTmpl.html", // файл шаблонов
            id: {
                content: "favoritesTmpl",//id шаблона формы авторизации
                empty : "emptyFavoritesTmpl"
            }, 
        },
        showBlocks : ['infoShop','addToCart','buy'],
        message :{
            clearGoods : 'Выбранные товары удалены из избранного.',
            failClearGoods : 'Произошла ошибка при удалении товара из избранного. Попробуйте еще раз.',
            confirmButchRemove : 'Вы уверены, что хотите удалить выбранный товар из избранного?',
            confirmRemove : 'Вы уверены что хотите удалить товар из избранного?',
            confirmClearFavorites : "Вы уверены, что хотите очистить избранное от товаров?"
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
            path : "orderTmpl.html", // файл шаблонов
            id : {
                step1 : "orderFormStep1Tmpl", //id шаблона формы заказа шаг 1
                step1Confirm : "orderConfirmFormStep1Tmpl", //id шаблона формы активации аккаунта при заказе шаг 1
                step1Profile : 'orderProfileFormStep1Tmpl', // id шаблона формы персоональных данных
                step2 : "orderFormStep2Tmpl", //id шаблона формы заказа шаг 2
                step2Form : 'orderDeliveryFormStep2Tmpl',
                step3 : "orderFormStep3Tmpl", //id шаблона формы заказа шаг 3
                step4 : "orderFormStep4Tmpl", //id шаблона формы заказа шаг 4
                step5 : "orderFormStep5Tmpl", //id шаблона формы заказа шаг 5
            }
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
            deleteOrderConfirm : 'Ваш заказ удален.',
            sendToken : 'Код активации успешно выслан по указанным данным.',
            failSendToken : 'Код не был отправлен. Попробуйте повторить запрос позднее.',
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
                uniq : 'Аккаунт для этого почтового ящика уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="https://pokupo.ru/resetting/request">Восстановить доступ</a>'
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
            phone : {
                empty : 'Поле обязательно для заполнения',
                regular : 'Не верный формат телефона',
                uniq : 'Аккаунт для этого номера телефона уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
            },
            emailToken : {
                empty : 'Поле обязательно для заполнения',
                confirm : 'Указанный код не принят системой'
            },
            phoneToken : {
                empty : 'Поле обязательно для заполнения',
                confirm : 'Указанный код не принят системой'
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
    OrderList : {
        tmpl : {
            path : "orderListTmpl.html", // файл шаблонов
            id : {
                list : "orderListTmpl", //id шаблона списка заказов
                empty : 'orderEmptyListTmpl', //id шаблона пустого списка
                detail : "orderDetailTmpl", //id шаблона списка заказов
            }
        },
        message : {
            orderConfirm : 'Ваш заказ подтвержден.',
            orderRepeat : "Ваш заказ повторен.",
            orderReturn : "Ваш заказ скопирован в корзину.",
            orderDelete : "Ваш заказ удален.",
            orderCancel : "Ваш заказ отменен.",
            confirmCancelOrder : 'Вы уверены, что хотите отменить заказ?',
            confirmDeleteOrder : 'Вы уверены, что хотите удалить заказ?'
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
    Message : {
        timer : 10,
        tmpl : {
            path : "messageTmpl.html", // файл шаблонов
            id : {
                topic : "messageTopicTmpl", //id шаблона списка тем
                list : "messageListTmpl", //id шаблона списка сообщений
                empty : 'messageEmptyListTmpl' //id шаблона пустого списка
            }
        },
        error : { // сообщения об ошибках при валидации формы регистрации
            username : {
                empty : 'Поле обязательно для заполнения',
                notFound : 'Получатель не найден.'
            },
            topic: {
                empty : 'Поле обязательно для заполнения'
            },
            text: {
                empty : 'Поле обязательно для заполнения'
            }
        },
        message : {
            noResult: "Писем нет :(",
            messageDelete : "Сообщение удалено.",
            topicDelete : "Тема Удалена.",
            severalTopicDelete : "Выбранные темы успешно удалены.",
            confirmDeleteMessage : 'Вы уверены, что хотите удалить сообщение?',
            confirmDeleteTopic : 'Вы уверены, что хотите удалить тему?',
            confirmDeleteSeveralTopic : 'Вы уверены, что хотите удалить выбранные темы?',
            error: 'Ошибка выполнения.'
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
    ButtonPayment : {
        title : "Оплатить", // заголовок кнопки
        tmpl : {
            path : 'buttonPaymentTmpl.html', // файл шаблонов
            id : {
                content : 'paymentPageTmpl', //id шаблона страницы оплаты
                skin : 'buttonPaymentImpl' //id шаблона кнопки
            }
        },
        Error : {
            required : 'Поле обязательно для заполнения.',
            regExp : 'Не допустимое значение.',
            maxlength : 'Максимум %s% символов.'
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


