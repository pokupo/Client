var AnimateSearchResult = function () {
    $('#advansed_search_form_slidedown').click(function (e) {
        e.preventDefault();
        var $this = $(this);
        $(this)
                .closest('.slidedown')
                .toggleClass('active')
                .find('.slidedown__content[data-target="' + $this.data('target') + '"]')
                .slideToggle(500);
    });
    $('#advansed_search_form__category_dropdown__trigger').click(function(e){
        e.preventDefault();
        var $this = $(this);

        if ($this.is('.disabled')) {
            return false;
        }

        if (0 < $('#advansed_search_form__category_dropdown__trigger.active').length) {
            $('#advansed_search_form__category_dropdown__trigger.active')
                    .not(this).removeClass('active')
                    .closest('.dropdown')
                    .find('.dropdown__content').addClass('hidden');
        }

        $this.toggleClass('active')
                .closest('.dropdown')
                .find('.dropdown__content')
                .toggleClass('hidden');
    });
    $('#advansed_search_form__category_dropdown__content a').click(function () {
        $(this).closest('#advansed_search_form__category_dropdown__content').toggleClass('hidden').
                siblings('#advansed_search_form__category_dropdown__trigger').toggleClass('active');
    });
    
    $(document).click(function (e) {
        var $this = $(e.target);

        if ($this.is('#advansed_search_form__category_dropdown__trigger')) {
            //
        } else {
            if (1 !== $this.parents().filter('#advansed_search_form__category_dropdown__content').length) {
                $('#advansed_search_form__category_dropdown__trigger.active').
                        removeClass('active').
                        siblings('#advansed_search_form__category_dropdown__content').addClass('hidden');
            }
        }
    });
    
    
    
    
    $('#typeSearch').chosen({
        disable_search_threshold: 6,
        width: '100%'
    });
    $('#typeSeller').chosen({
        disable_search_threshold: 6,
        width: '100%'
    });
    
    $("#multilocation").fancytree({
            minExpandLevel: 1,
            rootVisible: false,
            checkbox: true,
            selectMode: 3,
            icons: false,
            loadChildren: function (event, ctx) {
                // ctx.node.fixSelection3AfterClick();
            },
            select: function (event, data) {
                // Get a list of all selected nodes, and convert to a key array:
                var selKeys = $.map(data.tree.getSelectedNodes(), function (node) {
                    return parseInt(node.key.substring(1), 10);
                });
                Parameters.filter.idSelectCategories  = selKeys;

                $("#js-multilocation").removeClass('checked').addClass('part');
                if (data.tree.getSelectedNodes().length === 0) {
                    $("#js-multilocation").removeClass('part');
                }
            },
            keydown: function (event, data) {
                if (event.which === 32) {
                    data.node.toggleSelected();
                    return false;
                }
            }
        });
}

