/*
            ******* DataTablesFilter *****

        Plugin que adiciona um filtro de busca ao panel onde está localizada a tabela.

	PARÂMETROS:
        Passar os mesmos parâmetros que passaria ao datatables.


    DEPENDÊNCIAS:
        datatables.js
*/
(function ($){

	var DataTablesFilter = function (element,options){
		this.options = options;

        this.$element = $(element);

        this.init();
	}

        /* Alterar defaults a partir de $.fn.dataTablesFilter.Constructor.DEFAULTS */
	DataTablesFilter.DEFAULTS = {

    };

	DataTablesFilter.prototype = {
		constructor: DataTablesFilter,

		init: function () {
            var $heading = this.$element.parents(".panel").find(".panel-heading");
            var $title = $heading.find(".panel-title");
            $title.addClass("pull-left");
            var tableId = this.$element.attr("id");
            var template = '<form class="search-form" onsubmit="return false;"><input id="filter" class="form-control search-box" type="text" placeholder="Buscar" onKeyUp="$(' + "'#" + tableId + '\').dataTable().fnFilter(this.value);"></form>';
            $heading.append($(template))

            this.$element.dataTable(this.options);

		}
	}
	/*------------------------------------Plugin definition---------------------------------*/
	function Plugin(option) {
        var results = [];
        this.each(function (){
            var $this = $(this);
            var data = $(this).data('dataTablesFilter');
            var options = $.extend({}, DataTablesFilter.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) $this.data('dataTablesFilter', new DataTablesFilter(this, options));

            if (typeof option == 'string') {
                var result = data[option]();
                // Conferindo se a função retornou algo
                if (typeof result != "undefined" ) {
                    results.push(result);
                }
            }
        });

        // Caso a função chamada retornou resultados, os mesmos são retornados ao usuário
        if (results.length > 0) {
            return results;
        } else {
        // Caso contrário, o elemento é retornado
            return this;
        }
    }

    $.fn.dataTablesFilter = Plugin;
    $.fn.dataTablesFilter.Constructor = DataTablesFilter;

})(window.jQuery);
