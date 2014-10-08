var AnimateAdvancedSearch = function(){
    new Dyn();
    $("#tree_categories_for_advanced_search").dynatree({
        checkbox: true,
        selectMode: 3,
        children: Parameters.cache.categories,
        onSelect: function(select, node) {
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });

            Parameters.filter.idSelectCategories = selKeys;
        }
    });
}


