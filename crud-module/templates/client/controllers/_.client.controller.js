(function () {
  'use strict';

  // <%= humanizedPluralName %> controller
  angular
    .module('<%= slugifiedPluralName %>')
    .controller('<%= classifiedPluralName %>Controller', <%= classifiedPluralName %>Controller);

  <%= classifiedPluralName %>Controller.$inject = ['$scope', '$state', '$window', 'Authentication', '<%= camelizedSingularName %>Resolve', '$translatePartialLoader', '$translate'];

  function <%= classifiedPluralName %>Controller ($scope, $state, $window, Authentication, <%= camelizedSingularName %>, $translatePartialLoader, $translate) {
    var vm = this;

    vm.authentication = Authentication;
    vm.<%= camelizedSingularName %> = <%= camelizedSingularName %>;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    $translatePartialLoader.addPart('<%= slugifiedPluralName %>');
    $translate.refresh();

    // Remove existing <%= humanizedSingularName %>
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.<%= camelizedSingularName %>.$remove($state.go('<%= slugifiedPluralName %>.list'));
      }
    }

    // Save <%= humanizedSingularName %>
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.<%= camelizedSingularName %>Form');
        return false;
      }

      vm.<%= camelizedSingularName %>.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

      function successCallback(res) {
        $state.go('<%= slugifiedPluralName %>.view', {
          <%= camelizedSingularName %>Id: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
