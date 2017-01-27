(function () {
  'use strict';

  angular
    .module('<%= slugifiedPluralName %>')
    .controller('<%= classifiedPluralName %>ListController', <%= classifiedPluralName %>ListController);

  <%= classifiedPluralName %>ListController.$inject = ['<%= classifiedPluralName %>Service', '$translatePartialLoader', '$translate'];

  function <%= classifiedPluralName %>ListController(<%= classifiedPluralName %>Service, $translatePartialLoader, $translate) {
    var vm = this;

    vm.<%= camelizedPluralName %> = <%= classifiedPluralName %>Service.query();

    $translatePartialLoader.addPart('<%= slugifiedPluralName %>');
    $translate.refresh();
  }
}());
