/* Number formatting */
Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
    var n = this,
    decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
    decSeparator = decSeparator == undefined ? "." : decSeparator,
    thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
    sign = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

/* Função que simplesmente encapsula a função .replace("/0/",id) para evitar bugs. */
String.prototype.replaceId = function (id) {
	return this.replace("/0/","/" + id + "/");
};

/* Função jQuery para zerar formulário */
$.fn.resetForm = function (option) {

	this.each(function (){
		$(this).find('input:text, input:password, input:file, select, textarea').val('');
	    $(this).find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');

	});
	return this;
};

/* Conversão de underscore_notation para camelCase */
String.prototype.toCamelCase = function() {
    // remove all characters that should not be in a variable name
    // as well underscores an numbers from the beginning of the string
    var s = this.replace(/([^a-zA-Z0-9_\- ])|^[_0-9]+/g, "");
    s = $.trim(s).toLowerCase();
    // uppercase letters preceeded by an underscore or a space
    s = s.replace(/([ _]+)([a-zA-Z0-9])/g, function(a,b,c) {
        return c.toUpperCase();
    });

    // uppercase first letter
    s = s.charAt(0).toUpperCase() + s.slice(1);

    return s;
};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};