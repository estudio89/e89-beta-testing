/**
 * Filter a column on a specific date range. Note that you will likely need
 * to change the id's on the inputs and the columns in which the start and
 * end date exist.
 *
 *  @name Date range filter
 *  @summary Filter the table based on two dates in different columns
 *  @author _guillimon_
 *
 *  @example
 *    $(document).ready(function() {
 *        var table = $('#example').DataTable();
 *
 *        // Add event listeners to the two range filtering inputs
 *        $('#min').keyup( function() { table.draw(); } );
 *        $('#max').keyup( function() { table.draw(); } );
 *    } );
 *
 *
 *	ALTERAÇÃO (LUCCAS): id do input com range deve ser igual a "periodo"
 *
 */

$.fn.dataTable.ext.search.push(
	function( settings, data, dataIndex ) {
		var dateString = document.getElementById('periodo').value;
		var dateCol = 5;

		if (dateString === '') {
			return true;
		} else if (data[dateCol] === '-') {
			return true;
		}
		var dateFilter = dateString;


		dateFilter=dateFilter.substring(6,10) + dateFilter.substring(3,5)+ dateFilter.substring(0,2);

		var itemDate=data[dateCol].substring(6,10) + data[dateCol].substring(3,5)+ data[dateCol].substring(0,2);

		if ( dateFilter === "" )
		{
			return true;
		}
		else if ( dateFilter <= itemDate)
		{
			return false;
		}
		else if (dateFilter >= itemDate)
		{
			return true;
		}
		return false;
	}
);
