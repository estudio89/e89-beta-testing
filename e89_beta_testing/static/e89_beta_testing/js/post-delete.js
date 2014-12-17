/*
            ******* PostDelete *****
    Plugin que exclui um objeto após realizar um post. É passado ao plugin o id do elemento DOM
    que representa o objeto ou a classe que o define, sendo que ao final do post, esse
    elemento é excluído. O elemento DOM deverá possuir um data-attribute com nome object
    que é a representação em JSON do objeto (os atributos do objeto devem ser representados com
    aspas duplas, caso contrário ele não é convertido em JSON).

    Caso a iniciativa de excluir o objeto tenha sido disparada
    a partir de um modal, o modal é fechado automaticamente. Caso a url do post necessitar
    do id do elemento, deve ser colocado um id igual a zero ao montar a url e o id do
    elemento será automaticamente substituído no local apropriado (será obtido do data-object).

    O plugin é aplicado no botão que irá causar a exclusão do elemento.
    A resposta do post realizado DEVE ser do tipo json, portanto, mesmo que não seja
    necessária uma resposta, o servidor deve mandar pelo menos "[]", caso contrário
    o callback do post não é chamado.

    O plugin pode ser utilizado de duas maneiras: 1) exibindo um modal de confirmação da
    exclusão do objeto ou 2) passando somente o id do elemento a ser excluído após o POST.

    Caso deseja-se usar o plugin da maneira 1, a inicialização do plugin deve ser feita
    da seguinte forma:

    $(".btn-excluir").postDelete({
        postUrl: "{% url 'accounts.views.ajax_delete_perfil_acesso' id_perfil=0 %}",
        classContainer: ".perfil-object"
    });

    Caso o elemento esteja dentro de uma tabela, não é preciso passar o atributo "classContainer".
    Apenas é necessário que o elemento "tr" correspondente possua um data-attribute com nome "object"
    que possua o id do objeto.


    Veja que, nesse caso, os parâmetros idBtnDelete e templateModal não devem ser passados.
    Caso o botão no qual o plugin foi aplicado (nesse caso #btn-excluir) estiver
    dentro de um modal, o mesmo é fechado automaticamente.

    Caso deseja-se usar o plugin da maneira 2, devem ser passados como parâmetros adicionais
    o id do botão de confirmação do modal de exclusão (idBtnDelete) e o template para
    montagem do modal. Nessa situação o id do elemento não precisa ser passado, mas sim
    a classe utilizada no container do objeto. Dessa forma, o id do objeto a ser excluído
    é inferido a partir da localização do botão de exclusão, o que significa que o botão
    utilizado para excluir o elemento precisa estar necessariamente dentro do container do
    objeto. Por exemplo:

    $(".btn-excluir").postDelete({
        postUrl: "{% url 'accounts.views.ajax_add_perfil_acesso' %}",
        classContainer: ".perfil-object",
        idBtnDelete: "#btn-confirmar-modal",
        templateModal: #("#temp-modal-novo-perfil").html()
    });


	PARÂMETROS:
        postUrl: url pra onde é enviado o post.
        idOrRow: id do elemento que deve ser excluído do DOM ou elemento jquery da linha a ser excluída da tabela.
                 Caso for uma tabela e esse elemento não for passado, remove a linha onde está o botão. ( https://datatables.net/reference/api/row().remove() )
        classContainer: classe utilizada para definição do container do objeto. Caso o parâmetro idOrRow seja
                        passado, esse parâmetro é desnecessário.
        isTable: boolean indicando se o pai é uma tabela
        idTable: caso isTable for true, esse parâmetro é obrigatório
        idBtnDelete: id do botão que, ao acionado, realiza o post de exclusão do objeto. Opcional.
        templateModal: template do modal de confirmação da exclusão. Caso exista um form dentro do modal,
                       o form serializado é enviado com o post. Se o parâmetro idBtnDelete for passado,
                       esse argumento é obrigatório. O objeto a ser excluído, caso esteja no atributo data-object
                       do elemento do DOM a ser excluído, é repassado ao template sob o nome "object"
        dataTemplate: dados extras a serem passados ao template do modal sob o nome "data". Opcional.
        callback: Callback chamado após o post de exclusão recebendo como argumento a resposta (em json obrigatoriamente)
                  do servidor. Opcional, serve para atualizar valores que sejam exibidos a respeito do
                  objeto.
                  Exemplo:
                  {
                    callback: function(data) {
                        if (data === '' || data.length == 0)
                            return;

                        ... (atualização de valores exibidos) ...
                    }
                  }
    DEPENDÊNCIAS:
        underscore.js - http://underscorejs.org/
        jquery-validate.js - http://jqueryvalidation.org/
        primitive-extensions.js
*/
(function ($){

	var PostDelete = function (element,options,selector,idx){
        this.count = idx; // armazena o número de vezes que o construtor foi chamado.
                            // utilizado para evitar que um event handler para elementos
                            // adicionados dinamicamente seja duplicado
		this.options = options;

        this.$element = $(element);
        this.selector = selector;
        this.postUrl = this.options.postUrl;
        this.isTable = this.options.isTable;
        this.$table = $(this.options.idTable);
        this.idBtnDelete = this.options.idBtnDelete;
        if (this.options.templateModal !== '') {
            this.templateModal = _.template(this.options.templateModal);
        } else {
            this.templateModal = ['<div id="modal-post-delete" class="modal small fade" role="dialog" tabindex="-1" style="diplay: none;" aria-hidden="true">',
                   '<div class="modal-dialog">',
                      '<div class="modal-content">',
                        '<div class="modal-header">',
                          '<button class="close" aria-hidden="true" data-dismiss="modal" type="button"></button>',
                          '<h4 class="modal-title">' + this.options.modalTitle + '</h4>',
                        '</div>',
                        '<div class="modal-body text-center">',
                          '<h5>' + this.options.modalMessage + '</h5>',
                        '</div>',
                        '<div class="modal-footer">',
                          '<button class="btn btn-default" aria-hidden="true" data-dismiss="modal">Cancelar</button>',
                          '<button class="btn btn-success" id="btn-confirm-delete">Confirmar</button>',
                        '</div>',
                      '</div> <!-- /modal-content -->',
                    '</div> <!-- /modal-dialog -->',
                  '</div>'].join('\n');
            this.idBtnDelete = "#btn-confirm-delete"
        }
        this.dataTemplate = this.options.dataTemplate;
        this.callback = this.options.callback;

        if (this.$element.parents('table').length > 0) { // O botão está dentro de uma tabela
            this.options.classContainer = "tr";
        }

        // Verificando parâmetros fornecidos
        if (this.options.idOrRow === '' && this.options.classContainer === '')
            throw "Um dos parâmetros idOrRow ou classContainer precisa ser fornecido."

        if (this.options.idBtnDelete !== '' && this.options.templateModal === '')
            throw "Ao passar o parâmetro idBtnDelete, você tambêm deve passar o template do modal."
        else if (this.options.idBtnDelete !== '' && this.options.templateModal.indexOf(this.options.idBtnDelete.replace("#","").replace(".","")) === -1)
            throw "O seletor do botão de exclusão do objeto (" + this.options.idBtnDelete + ") não está definido no template do modal. Confira o código do template.";

        // Buscando elemento a ser excluído
        this.getElementDelete(this.$element, true);

        this.init();
	}

        /* Alterar defaults a partir de $.fn.postDelete.Constructor.DEFAULTS */
	PostDelete.DEFAULTS = {
        postUrl: '',
        idOrRow: '',
        classContainer: '',
        isTable: false,
        idTable: '',
        idBtnDelete: '',
        templateModal: '',
        dataTemplate: '',
        callback: '',
        modalTitle: 'Excluir',
        modalMessage: 'Você tem certeza que deseja excluir esse objeto?'
    };

	PostDelete.prototype = {
		constructor: PostDelete,

		init: function () {
            if (this.count > 0) {
                return; // impede que os callbacks que se aplicam a elementos dinâmicos sejam duplicados
            }

            if (this.idBtnDelete !== '') {
                // Exibição de modal de confirmação
                var _this = this;

                $('body').on('click',_this.selector,function(ev){
                    _this.getElementDelete($(ev.target),false);
                    // Impedindo conflito de recriação do modal
                    _this.$modal.on('hidden.bs.modal',function() { $(this).remove(); });
                    _this.$modal.on('shown.bs.modal',function() { _this.setOnClickPost(_this.idBtnDelete,false); });
                    _this.$modal.modal('show');
                });

            } else {
                this.setOnClickPost(this.$element,true);
            }

		},

        getModal: function() {
            this.$modal = $(this.options.idModal);
        },

        getForm: function() {
            if (this.$modal.length > 0) {
                this.$form = this.$modal.find("form");
            } else {
                this.$form = $("");
            }
        },

        getElementDelete: function($element,considerId) {
            /*
               Método para obter o elemento a ser excluído. Esse método é necessário para
               que o plugin funcione mesmo para elementos obtidos dinâmicamente.
               Caso deseja-se que a busca pelo elemento a ser excluído considere o parâmetro
               idOrRow, o argumento considerId deve ser true (caso em que o método é chamado dentro do init,
               devido a um elemento que não foi adicionado dinamicamente).
            */

            if (considerId)
                this.$elDelete = this.options.idOrRow === '' ? this.$element.parents(this.options.classContainer): $(this.options.idOrRow);
            else
                this.$elDelete = $element.parents(this.options.classContainer);

            // Buscando objeto
            this._object = this.$elDelete.data("object");
            if(typeof this._object === 'undefined')
                throw "Data attribute data-object não encontrado no elemento a ser excluído. Reveja o template de listagem de objetos.";


            // Alterando parâmetros que dependem do objeto
            var strTemplate;
            if (typeof this.templateModal === 'string') {
                strTemplate = this.templateModal;
            } else {
                strTemplate = this.templateModal({object:this._object});
            }
            this.$modal = $(strTemplate).filter('.modal');
            this.$form = this.$modal.find("form");
        },

        getPostUrl: function() {
            /* Esse método existe porque se o valor salvo em this.postUrl for alterado, ele é alterado para todos
               os objetos, causando erro após o primeiro objeto ser excluído. */
            return this.postUrl.replaceId(this._object.id);
        },
        setOnClickPost: function(btn,applyDynamic) {
            /*
               Método que faz com que no onClick do botão passado, seja feito o post
               de exclusão do objeto e remoção do elemento no DOM.
               Caso o onClick deva ser aplicado também para elementos
               adicionados dinamicamente (o que só ocorre quando não é
               exibido um modal de confirmação), o argumento applyDynamic
               deve ser true.
            */

            var $btn = $(btn);
            var _this = this;
            var callback = function(ev){

                if (applyDynamic)
                    _this.getElementDelete($(ev.target),false);

                // Validação do formulário (caso exista)
                _this.getForm();
                if (_this.$form.length > 0) {
                    if (!_this.$form.valid()) {
                        return;
                    }
                }

                // Verificando se foi passado callback
                var _dataType = "text";
                if (this.callback !== '') {
                    _dataType = "json";
                }
                $btn.button("loading");
                _this.getModal();
                $.ajax({
                        type: 'POST',
                        data: _this.$form.serialize(),
                        dataType: _dataType,
                        url: _this.getPostUrl(),
                        success: function (data) {

                            if (_this.$elDelete.parents('table').length > 0) { // O elemento está dentro de uma tabela
                                var $table = _this.$elDelete.parents('table');
                                if ($table.DataTable().length > 0) { // nova API
                                    $table.DataTable().row(_this.$elDelete).remove().draw();
                                } else { // API antiga
                                    $table.dataTable().fnDeleteRow(_this.$elDelete);
                                    $table.dataTable().fnDraw();
                                }

                            } else {
                                _this.$elDelete.remove();
                            }

                            if (_this.callback !== '') {
                                _this.callback(data);
                            }
                            if ($btn.parents(".modal").length > 0) {
                                var $modalParent = $btn.parents(".modal");
                                $modalParent.on('hidden.bs.modal',function(){$btn.button("reset");});
                                $modalParent.modal("hide");
                            } else {
                                $btn.button("reset");
                            }

                        }
                    });
            }
            if (applyDynamic) {
                $('body').on('click',_this.selector,callback);
            } else {
                $btn.on('click',callback);
            }
        }

	}
	/*------------------------------------Plugin definition---------------------------------*/
	function Plugin(option) {
        var results = [];
        var _this = this;
        this.each(function (idx){
            var $this = $(this);
            var data = $(this).data('postDelete');
            var options = $.extend({}, PostDelete.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) $this.data('postDelete', new PostDelete(this, options, _this.selector, idx));

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

    $.fn.postDelete = Plugin;
    $.fn.postDelete.Constructor = PostDelete;

})(window.jQuery);