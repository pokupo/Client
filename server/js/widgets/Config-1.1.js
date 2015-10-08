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
        catalog: {widget: 'catalogWidgetId', def: 'defaultCatalogWidgetId', customClass: 'custom_block'}, // id контейнера каталога
        search: {widget: 'searchWidgetId', def: 'defaultSearchWidgetId', customClass: 'custom_block'}, // id контейнера формы поиска
        breadCrumb: {
            widget: ['breadCrumbsWidgetId_1'],
            def: ['defaultBreadCrumbsWidgetId_1', 'defaultBreadCrumbsWidgetId_2'],
            customClass: ['custom_block_1, custom_block_2']
        }, // id контейнеров хлебных крошек
        content: {
            content: {widget: 'content', def: 'defaultContentWidgetId', customClass: 'custom_block'},
            block: {
                slider: {widget: 'sliderBlockId', def: 'defaultSliderBlockId', customClass: 'slider_custom_block'},
                carousel: {
                    widget: 'carouselBlockId',
                    def: 'defaultSliderBlockId',
                    customClass: 'carousel_custom_block'
                },
                tile: {widget: 'tileBlockId', def: 'defaultTileBlockId', customClass: 'tile_custom_block'},
                empty: {widget: 'emptyBlockId', def: 'defaultEmptyBlockId', customClass: 'custom_block'}
            }
        }, // id контейнера контента
        searchResult: {
            form: {
                widget: 'advancedSearchFormWidgetId',
                def: 'defaultAdvancedSearchFormWidgetId',
                customClass: 'custom_block'
            },
            content: {widget: 'content', def: 'defaultAdvancedSearchResultWidgetId', customClass: 'custom_block'}
        }, // id контейнеров расширенной формы и результатов поиска
        goods: {widget: 'content', def: 'defaultGoodsWidgetId', customClass: 'custom_block'}, // id контейнера информации о товаре
        standaloneGoods: {widget: 'content', def: 'defaultStandaloneGoodsWidgetId', customClass: 'custom_block'}, // id контейнера информации о товаре
        userInformation: {
            widget: 'userInformationWidgetId',
            def: 'defaultUserInformationWidgetId',
            customClass: 'custom_block'
        }, // id контейнера информации о пользователе
        authentication: {
            widget: 'authenticationWidgetId',
            def: 'defaultAuthenticationWidgetId',
            customClass: 'custom_block'
        }, //id контейнеров авторизации
        registration: {widget: 'content', def: 'defaultRegistrationWidgetId', customClass: 'custom_block'}, // id контейнера регистрации
        registrationSeller: {widget: 'content', def: 'defaultRegistrationSellerWidgetId', customClass: 'custom_block'}, // id контейнера регистрации продавца
        cart: {widget: 'cartInfoWidgetId', def: 'defaultCartInfoWidgetId', customClass: 'custom_block'}, // id контейнера корзины
        cartGoods: {widget: 'content', def: 'defaultCartGoodsWidgetId', customClass: 'custom_block'}, // id контейнера реестра товаров корзины
        cabinetCartGoods: {widget: 'content', def: 'defaultCartGoodsCabinetWidgetId', customClass: 'custom_block'},
        profile: {widget: 'content', def: 'defaultProfileWidgetId', customClass: 'custom_block'}, // id контейнера меню профиля и содержимого
        menuPersonalCabinet: {
            widget: 'menuPersonalCabinetWidgetId',
            def: 'defaultMenuPersonalCabinetWidgetId',
            customClass: 'custom_block'
        },
        favorites: {widget: 'content', def: 'defaultFavoritesWidgetId', customClass: 'custom_block'}, // id контейнера избранного
        order: {widget: 'content', def: 'defaultOrderWidgetId', customClass: 'custom_block'}, // id конетейнера оформления заказа
        orderList: {widget: 'content', def: 'defaultOrderListWidgetId', customClass: 'custom_block'}, // id конетейнера списка заказов
        buttonPayment: {widget: 'content', def: 'defaultPaymentWidgetId', customClass: 'custom_block'}, // id контейнера страницы оплаты
        standalonePayment: {
            content: {widget: 'content', def: 'defaultStandalonePaymentWidgetId', customClass: 'custom_block'},
            button: {
                widget: 'standalonePaymentWidgetId',
                def: 'defaultStandalonePaymentWidgetId',
                customClass: 'custom_block'
            }
        }, // id контейнера страницы оплаты
        statusPayment: {widget: 'content', def: 'defaultStatusPaymentWidgetId', customClass: 'custom_block'},
        shopInfo: {widget: 'shopInfoWidgetId', def: 'defaultShopInfoWidgetId', customClass: 'custom_block'},
        message: {widget: 'content', def: 'defaultMessageWidgetId', customClass: 'custom_block'} // id контейнера списка сообщений
    },
    Goods: {},
    StandaloneGoods: {},
    Catalog: {},
    BreadCrumb: {},
    Content: {},
    Search: {},
    SearchResult: {},
    RelatedGoods: {},
    InfoSeller: {},
    UserInformation: {},
    Authentication: {},
    Registration: {
        regular: { // регулярные выражения полей
            username: /^[а-яёa-zА-ЯЁA-Z0-9_\-\.\s]+$/,
            email: /^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/,
            phone: /^([\d]{1})\s([\d]{3})\s([\d]{3})\s([\d]{2})\s([\d]{2})(\s([\d]{2}))?$/,
            firstName: /^[a-zёа-яА-ЯЁA-Z]+$/,
            lastName: /^[a-zа-яёА-ЯЁA-Z]+$/,
            middleName: /^[a-zа-яёА-ЯЁA-Z]+$/,
            birthDay: /^[\d]{2}.[\d]{2}.[\d]{4}$/,
            gender: /^[mw]$/,
            postIndex: /^[0-9]+$/
        },
        message: {
            registrationSuccessful: "Вы успешно зарегистрировались в магазине"
        },
        error: { // сообщения об ошибках при валидации формы регистрации
            username: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Минимум 4 символа',
                maxLength: 'Максимум 40 символов',
                regular: 'Только буквы латинского или русского алфавита',
                uniq: 'К сожалению это имя уже занято, попробуйте указать другой вариант'
            },
            email: {
                empty: 'Поле обязательно для заполнения',
                maxLength: 'Максимум 64 символа',
                regular: 'Строка не является адресом электронной почты',
                uniq: 'Аккаунт для этого почтового ящика уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="https://pokupo.ru/resetting/request">Восстановить доступ</a>'
            },
            phone: {
                regular: 'Не верный формат телефона',
                uniq: 'Аккаунт для этого номера телефона уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="https://pokupo.ru/resetting/request">Восстановить доступ</a>'
            },
            password: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Пароль должен быть не менее 6 символов',
                maxLength: 'Пароль должен быть не более 64 символов',
                equal: 'Пароль не совпадает с образцом'
            },
            isChecked: {
                empty: 'Вам необходимо прочитать и принять условия соглашения'
            },
            emailToken: {
                empty: 'Поле обязательно для заполнения',
                confirm: 'Указанный код не принят системой'
            },
            phoneToken: {
                empty: 'Поле обязательно для заполнения',
                confirm: 'Указанный код не принят системой'
            },
            confirmLater: {
                empty: 'Для активации аккаунта требуется подтвердить хотя бы один из способов связи'
            },
            firstName: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Минимум 2 символа',
                maxLength: 'Максимум 20 символов',
                regular: 'Только буквы латинского или русского алфавита'
            },
            lastName: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Минимум 2 символа',
                maxLength: 'Максимум 20 символов',
                regular: 'Только буквы латинского или русского алфавита'
            },
            middleName: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Минимум 2 символа',
                maxLength: 'Максимум 20 символов',
                regular: 'Только буквы латинского или русского алфавита'
            },
            birthDay: {
                empty: 'Поле обязательно для заполнения',
                minDate: 'Возраст пользователя должен быть не менее 18 лет.',
                maxDate: 'Возраст пользователя может быть не старше 101 года'
            },
            gender: {
                empty: 'Поле обязательно для заполнения'
            },
            country: {
                empty: 'Поле обязательно для заполнения'
            },
            region: {
                empty: 'Поле обязательно для заполнения'
            },
            city: {
                empty: 'Поле обязательно для заполнения'
            },
            address: {
                empty: 'Поле обязательно для заполнения'
            },
            postIndex: {
                empty: 'Поле обязательно для заполнения',
                length: 'В почтовом индексе должно быть 5 или 6 цифр',
                regular: 'Только цифры'
            }
        }
    },
    RegistrationSeller: {},
    MenuPersonalCabinet: {},
    ModalMessage: {},
    Profile: {
        tmpl: {
            path: "profileTmpl.html", // файл шаблонов
            id: {
                personal: "personalInformationTmpl", //id шаблона формы персоональных данных
                delivery: "deliveryAddressTmpl", //id шаблона списка адресов доставки
                deliveryForm: "deliveryAddressFormTmpl", //id шаблона формы адресов доставки
                security: "securityTmpl" //id шаблона формы смены пароля
            }
        },
        menu: {
            personalInformation: {title: 'Персональные данные', prefix: 'personal'},
            deliveryAddress: {title: 'Адреса доставки', prefix: 'delivery'},
            security: {title: 'Безопасность', prefix: 'security'}
        },
        regular: { // регулярные выражения полей
            email: /^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/,
            phone: /^([\d]{1})\s([\d]{3})\s([\d]{3})\s([\d]{2})\s([\d]{2})(\s([\d]{2}))?$/,
            firstName: /^[a-zёа-яА-ЯЁA-Z]+$/,
            lastName: /^[a-zа-яёА-ЯЁA-Z]+$/,
            middleName: /^[a-zа-яёА-ЯЁA-Z]+$/,
            birthDay: /^[\d]{2}.[\d]{2}.[\d]{4}$/,
            addressee: /^[a-zа-яёА-ЯЁA-Z\s]+$/,
            postIndex: /^[0-9]+$/
        },
        message: {
            sendToken: 'Код активации успешно выслан по указанным данным.',
            failSendToken: 'Код не был отправлен. Попробуйте повторить запрос позднее.',
            contactsEdit: 'Данные успешно обновлены',
            failContactsEdit: 'Данные не обновлены. Попробуйте повторить запрос позднее.',
            editProfile: 'Данные успешно обновлены',
            failEditProfile: 'Данные не обновлены. Попробуйте повторить запрос позднее.',
            changePassword: 'Пароль успешно изменен.',
            failChangePassord: 'Пароль не изменен.',
            addAddressDelivery: 'Данные успешно сохранены.',
            failAddAddressDelivery: 'Данные не сохранены. Попробуйте повторить запрос позднее.',
            deleteAddressDelivery: 'Адрес доставки успешно удален.',
            confirmDeleteAddressDelivery: "Вы уверены, что хотите удалить адрес?",
            failDeleteAddressDelivery: 'Адрес доставки не удален. Попробуйте повторить запрос позднее.',
            setDefaultDelivery: 'Данные успешно обновлены.',
            failSetDefaultDelivery: 'Данные не обновлены.'
        },
        error: { // сообщения об ошибках при валидации формы регистрации
            iconUser: {
                extension: 'Раширение фала должно быть jpeg, png или gif'
            },
            email: {
                empty: 'Поле обязательно для заполнения',
                maxLength: 'Максимум 64 символа',
                regular: 'Строка не является адресом электронной почты',
                uniq: 'Аккаунт для этого почтового ящика уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
            },
            phone: {
                empty: 'Поле обязательно для заполнения',
                regular: 'Не верный формат телефона',
                uniq: 'Аккаунт для этого номера телефона уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
            },
            password: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Пароль должен быть не менее 6 символов',
                maxLength: 'Пароль должен быть не более 64 символов',
                equal: 'Пароль не совпадает с образцом'
            },
            emailToken: {
                empty: 'Поле обязательно для заполнения',
                confirm: 'Указанный код не принят системой'
            },
            phoneToken: {
                empty: 'Поле обязательно для заполнения',
                confirm: 'Указанный код не принят системой'
            },
            addressee: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Минимум 2 символа',
                maxLength: 'Максимум 20 символов',
                regular: 'Только буквы латинского или русского алфавита'
            },
            firstName: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Минимум 2 символа',
                maxLength: 'Максимум 20 символов',
                regular: 'Только буквы латинского или русского алфавита'
            },
            lastName: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Минимум 2 символа',
                maxLength: 'Максимум 20 символов',
                regular: 'Только буквы латинского или русского алфавита'
            },
            middleName: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Минимум 2 символа',
                maxLength: 'Максимум 20 символов',
                regular: 'Только буквы латинского или русского алфавита'
            },
            birthDay: {
                empty: 'Поле обязательно для заполнения',
                minDate: 'Возраст пользователя должен быть не менее 18 лет.',
                maxDate: 'Возраст пользователя может быть не старше 101 года'
            },
            country: {
                empty: 'Поле обязательно для заполнения'
            },
            region: {
                empty: 'Поле обязательно для заполнения'
            },
            city: {
                empty: 'Поле обязательно для заполнения'
            },
            address: {
                empty: 'Поле обязательно для заполнения'
            },
            postIndex: {
                empty: 'Поле обязательно для заполнения',
                length: 'В почтовом индексе должно быть 5 или 6 цифр',
                regular: 'Только цифры'
            }
        },
        style: {// стиль блока
            'position': 'absolute',
            'top': '0px',
            'left': '5%',
            'width': '100%',
            'height': '50px',
            'background': '#ddd'
        }
    },
    Cart: {},
    CartGoods: {},
    CabinetCartGoods: {},
    Favorites: {},
    Order: {},
    OrderList: {},
    Message: {},
    ButtonPayment: {},
    StandalonePayment: {},
    StatusPayment: {},
    ShopInfo: {},
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


