/**
 * Filtra a tabela de alertas pela delegacia.
 *
 */

$.fn.dataTable.ext.search.push(
	function( settings, data, index ) {
		var colunaDelegacia = 7;
		var delegacias = $('#delegacia').val();
		if (delegacias === '') {
			return true;
		}
		var newDelegacias = [];
		$.each(delegacias,function(idx,val){
			newDelegacias.push("(," + val + ",)");
		});

		var strDelegacias = newDelegacias.join('|');

		var matches = data[colunaDelegacia].match(new RegExp(strDelegacias,"i")); // /i para ignore case
		return matches !== null;
	}
);
