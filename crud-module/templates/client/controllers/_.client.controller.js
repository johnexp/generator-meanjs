(function () {
  'use strict';

  // <%= humanizedPluralName %> controller
  angular
    .module('<%= slugifiedPluralName %>')
    .controller('<%= classifiedPluralName %>Controller', <%= classifiedPluralName %>Controller);

  <%= classifiedPluralName %>Controller.$inject = ['$scope', '$state', '$window', 'Authentication', '<%= camelizedSingularName %>Resolve'<% if (internationalization) { %>, '$translatePartialLoader', '$translate'<% } %>, '$mdMedia', 'DialogService', 'Toast', '$log'];

  function <%= classifiedPluralName %>Controller ($scope, $state, $window, Authentication, <%= camelizedSingularName %><% if (internationalization) { %>, $translatePartialLoader, $translate<% } %>, $mdMedia, DialogService, Toast, $log) {
    var vm = this;

    vm.authentication = Authentication;
    vm.<%= camelizedSingularName %> = <%= camelizedSingularName %>;
    vm.form = {};<% if (logicalExclusion) { %>
    vm.changeState = changeState;<% } else { %>
    vm.remove = remove;<% } %>
    vm.save = save;
    vm.$mdMedia = $mdMedia;<% if (internationalization) { %>

    $translatePartialLoader.addPart('<%= slugifiedPluralName %>');
    $translate.refresh();
<% } %><% if (logicalExclusion) { %>
    // Change activation state of an existing <%= humanizedSingularName %>
    function changeState(ev) {
      DialogService.showConfirmInactivation(ev, function (option) {
        if (option === true) {
          vm.<%= camelizedSingularName %>.$remove(function () {
            vm.<%= camelizedSingularName %>.active = false;
          }, function (res) {
            Toast.genericErrorMessage();
            $log.error(res.data.message);
          });
        }
      });
    }<% } else { %>
    // Remove existing <%= humanizedSingularName %>
    function remove(ev) {
      DialogService.showConfirmDeletion(ev, function (option) {
        if (option === true) {
          vm.<%= camelizedSingularName %>.$remove(function () {
            $state.go('<%= slugifiedPluralName %>.list');
          }, function (res) {
            Toast.genericErrorMessage();
            $log.error(res.data.message);
          });
        }
      });
    }<% } %>

    // Save <%= humanizedSingularName %>
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.<%= camelizedSingularName %>Form');<% if (internationalization) { %>
        Toast.error($translate.instant('Some fields were not filled correctly'));<% } else { %>
        Toast.error('Some fields were not filled correctly');<% } %>
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
        Toast.genericErrorMessage();
        $log.error(res.data.message);
      }
    }
  }
}());
