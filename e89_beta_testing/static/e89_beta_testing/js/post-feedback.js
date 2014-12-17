(function ($){
	/*
		Plugin para realizar post (de formulário ou não) e exibir mensagem de feedback ao final.

		Utilização com formulário:

		$("#btn-enviar").postFeedback({
			modalTitle: "Alteração realizada",
			texto: "A alteração foi realizada.",
			idForm: "#form-enviar"
		});

		Caso esteja sendo feito post sem formulário:

		$("#btn-enviar").postFeedback({
			modalTitle: "Alteração realizada",
			texto: "A alteração foi realizada.",
			postData: {"teste":"teste"},
			postUrl:'/teste/'
		});

		*** Necessita do plugin jquery.validation.js

		PARÂMETROS:
			modalTitle: Título do modal.
			texto: Texto que aparece no modal.
							Ex: "Formulário enviado."
			postData: Dados a serem enviados (padrão = $(idForm).serialize())
			extraPostData: Dados extras a serem enviados (opcional - function).
			idForm: id do formulário.
			postUrl: url do post.
			textResponse: true ou false. Seta o texto do modal igual à resposta do server (Default: false).
			cleanForm: true ou false. Limpa o formulário após o envio (Default: true).
	*/

	var PostFeedback = function (element,options){

        this.options = $.extend({
			modalTitle: '',
	        texto: '',
	        idForm: '',
	        postData:'',
	        extraPostData:'',
	        postUrl:'',
	        cleanForm:true,
	        textResponse: false
	    }, options);

	    this.$btnSubmit = $(element);
	    this.extraPostData = this.options.extraPostData;

		if (this.options.idForm !== '') {
			this.$form = $(this.options.idForm);
			this.postUrl = this.$form.attr('action');
		} else {
			this.postData = this.options.postData;
			this.postUrl = this.options.postUrl;
		}

		this.init(element,options);
	}

	PostFeedback.prototype = {
		constructor: PostFeedback,

		init: function (element,options) {

			/* Ativando validação do formulário */

			if (this.options.idForm !== '' ) {
				try {
					this.$form.validate();
				} catch (err) {
					throw "Necessita do plugin jquery.validation.js!";
				}
			}

			var _this = this;
			this.$btnSubmit.on('click',function (ev){
				ev.preventDefault();
				if(_this.options.idForm !== '' ) {
					if (!_this.$form.valid()) {
						return;
					}
					_this.postData = _this.$form.serialize();
					if (_this.extraPostData !== '' && _this.postData !== '') {
						_this.postData = _this.postData + '&' + _this.extraPostData();
					}

				}
				_this.$btnSubmit.button("loading");
				$.ajax({
	      			type: 'POST',
	      			data: _this.postData,
	      			url: _this.postUrl,
	      			success: function (data) {
      					_this.$btnSubmit.button('reset');
      					if (_this.options.textResponse) {
      						_this.options.texto = data;
      					}
      					_this.buildModal();

      					// Fechando modal
                        if (_this.$btnSubmit.parents(".modal").length > 0) {
                            var $modalParent = _this.$btnSubmit.parents(".modal");
                            $modalParent.on('hidden.bs.modal',function(){_this.$btnSubmit.button("reset");});
                            $modalParent.modal("hide");
                        } else {
                            _this.$btnSubmit.button("reset");
                        }

                        // Limpando form
                        if (_this.options.cleanForm && _this.options.idForm !== '')
                        	_this.$form.find("input, textarea").val("");

                        // Exibindo modal
      					_this.$modalHTML.modal('show');
	      			}
	      		});
			});
		},

		buildModal: function() {
			var defaultModalHTML =
		        ['<div id="modal-excluir-objeto" class="modal small fade" role="dialog" tabindex="-1" style="diplay: none;" aria-hidden="true">',
		           '<div class="modal-dialog">',
		              '<div class="modal-content">',
				        '<div class="modal-header">',
				          '<button class="close" aria-hidden="true" data-dismiss="modal" type="button"></button>',
				          '<h4 class="modal-title">' + this.options.modalTitle + '</h4>',
				        '</div>',
				        '<div class="modal-body text-center">',
				          '<h5>' + this.options.texto + '</h5>',
				        '</div>',
				        '<div class="modal-footer">',
				          '<button class="btn btn-primary" aria-hidden="true" data-dismiss="modal">OK</button>',
				        '</div>',
				      '</div> <!-- /modal-content -->',
				    '</div> <!-- /modal-dialog -->',
				  '</div>'].join('\n');
			this.$modalHTML = $(defaultModalHTML);
		}
	}
	/*------------------------------------Plugin definition---------------------------------*/
	$.fn.postFeedback = function (option) {
        var results = [];
        this.each(function (){
            var $this = $(this);
            var data = $(this).data('postFeedback');
            var options = typeof option == 'object' && option;
            if (!data) {
                $this.data('postFeedback', new PostFeedback($this, options));
            }
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
})(window.jQuery);