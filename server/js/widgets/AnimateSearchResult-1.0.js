var AnimateSearchResult = function () {
    $('body').on("click", '#advansed_search_form_slidedown', function (e) {
        e.preventDefault();
        var $this = $(this);
        $(this)
                .closest('.slidedown')
                .toggleClass('active')
                .find('.slidedown__content[data-target="' + $this.data('target') + '"]')
                .slideToggle(500);
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

