/* Changing classes for datatables */
try {
    $.fn.dataTableExt.oStdClasses.sPaging = "dataTables_paginate paging_full_numbers col-md-6 ";
    $.fn.dataTableExt.oStdClasses.sPageButton = "btn btn-primary paging-buttons";
    $.fn.dataTableExt.oStdClasses.sLength = "dataTables_length col-md-2 text-center";
    $.fn.dataTableExt.oStdClasses.sInfo = "dataTables_info col-md-4";

    $.extend(true, $.fn.dataTable.defaults, {
        "sDom":'<"top">rt<"bottom"ilp><"clear">',
        "bSortClasses":false,
        "sPaginationType":"simple_numbers",
        "iDisplayLength":15,
        "lengthMenu": [[15, 25, 50, -1], [15, 25, 50, "Todos"]],
        "oLanguage": {
	      "oPaginate": {
	        "sFirst": "Primeira",
	        "sLast": "Última",
	        "sPrevious": "Anterior",
	        "sNext": "Próxima"

	      },
	      "sEmptyTable":"Não há dados a serem exibidos.",
	      "sInfo": "Exibindo itens _START_ a _END_ de um total de _TOTAL_",
	      "sInfoEmpty": "Exibindo 0 de 0 itens",
	      "sInfoFiltered": "(filtrados de um total de _MAX_ itens)",
	      "sLengthMenu":"Exibir _MENU_ itens",
	      "sLoadingRecords":"<i class=\'fa fa-spinner fa-spin\'></i>  Carregando...",
	      "sSearch":"Buscar",
	      "sZeroRecords":"Nenhum item encontrado",
	      "sDecimal":",",
	      "sThousands":"."

	    }

    });
} catch(err){
}