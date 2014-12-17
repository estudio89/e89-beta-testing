/**
 * Filtra a tabela de alertas pelo ramo de atividades.
 *
 */

$.fn.dataTable.ext.search.push(
	function( settings, data, index ) {
		var colunaRamos = 6;
		var ramo = document.getElementById('ramo').value;
		if (ramo === '' || ramo === null) {
			return true;
		}
		var data = "," + data[colunaRamos] + ",";
		var matches = data.match(new RegExp("," + ramo + ",","i")); // /i para ignore case
		return matches !== null;
	}
);
