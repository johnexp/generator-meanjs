(function () {
  'use strict';

  angular
    .module('<%= slugifiedPluralName %>')
    .controller('<%= classifiedPluralName %>ListController', <%= classifiedPluralName %>ListController);

  <%= classifiedPluralName %>ListController.$inject = ['List<%= classifiedPluralName %>Service', '<%= classifiedPluralName %>Service'<% if (internationalization) { %>, '$translatePartialLoader', '$translate'<% } %><% if (listType == 'complex') { %>, 'PaginationService'<% } %><% if (filterType == 'angular') { %>, '$filter'<% } %>, 'Toast', 'DialogService', '$log'];

  function <%= classifiedPluralName %>ListController(List<%= classifiedPluralName %>Service, <%= classifiedPluralName %>Service<% if (internationalization) { %>, $translatePartialLoader, $translate<% } %><% if (listType == 'complex') { %>, PaginationService<% } %><% if (filterType == 'angular') { %>, $filter<% } %>, Toast, DialogService, $log) {
    var vm = this;<% if (listType == 'complex') { %>
    vm.pagination = PaginationService.getPagination();
    vm.pagination.sort = 'name';<% } if (filterType == 'angular') { if (logicalExclusion) { %>
    vm.all<%= classifiedPluralName %> = List<%= classifiedPluralName %>Service.getByState({ active: true });<% } else { %>
    vm.all<%= classifiedPluralName %> = List<%= classifiedPluralName %>Service.getAll();<% }} %>
    vm.<%= camelizedPluralName %> = <% if (filterType == 'database') { %>{}<% } else { %>vm.all<%= classifiedPluralName %><% } %>;
    vm.<%= camelizedSingularName %>Filter = {<% if (logicalExclusion) { %> active: true <% } %>};<% if (filterType == 'angular') { %>
    vm.filterItems = filterItems;<% if (refilterActives) { %>
    vm.refilter = refilter;<% } %><% } %><% if (logicalExclusion) { %>
    vm.changeState = changeState;<% } else { %>
    vm.remove = remove;<% } %><% if (filterType == 'database') { %>
    vm.filter = filter;<% } %><% if (filterType == 'angular') { %>

    function filterItems() {
      angular.forEach(vm.<%= camelizedSingularName %>Filter, function (value, key) {
        if (value === '') {
          delete vm.<%= camelizedSingularName %>Filter[key];
        }
      });
      vm.<%= camelizedPluralName %> = $filter('filter')(vm.all<%= classifiedPluralName %>, vm.<%= camelizedSingularName %>Filter);
    }<% if (refilterActives) { %>

    function refilter() {
      vm.all<%= classifiedPluralName %> = List<%= classifiedPluralName %>Service.getByState({ active: vm.<%= camelizedSingularName %>Filter.active }, function () {
        vm.<%= camelizedPluralName %> = vm.all<%= classifiedPluralName %>;
        vm.<%= camelizedSingularName %>Filter = { active: vm.<%= camelizedSingularName %>Filter.active };
      });
    }<% } %><% } %><% if (logicalExclusion) { %>

    // Change activation state of an existing <%= humanizedSingularName %>
    function changeState(ev, <%= camelizedSingularName %>) {
      DialogService.showConfirmInactivation(ev, function (option) {
        if (option === true) {
          var <%= classifiedSingularName %>Resource = new <%= classifiedPluralName %>Service();
          <%= classifiedSingularName %>Resource.$remove({ <%= camelizedSingularName %>Id: <%= camelizedSingularName %>._id }, function () {
            filter();
          }, function (res) {
            Toast.genericErrorMessage();
            $log.error(res.data.message);
          });
        }
      });
    }<% } else { %>

    // Remove existing <%= humanizedSingularName %>
    function remove(ev, <%= camelizedSingularName %>) {
      DialogService.showConfirmDeletion(ev, function (option) {
        if (option === true) {
          var <%= classifiedSingularName %>Resource = new <%= classifiedPluralName %>Service();
          <%= classifiedSingularName %>Resource.$remove({ <%= camelizedSingularName %>Id: <%= camelizedSingularName %>._id }, function () {
            refilter();
          }, function (res) {
            Toast.genericErrorMessage();
            $log.error(res.data.message);
          });
        }
      });
    }<% } %><% if (filterType == 'database') { %>

    function filter() {
      List<%= classifiedPluralName %>Service.query({ filter: vm.<%= camelizedSingularName %>Filter, queryCount: true }, function (result) {
        vm.pagination.queryLimit = result[0];
        PaginationService.setOffset(vm.pagination);
        vm.queryPromise = List<%= classifiedPluralName %>Service.query({ filter: vm.<%= camelizedSingularName %>Filter, pagination: vm.pagination }, function (result) {
          vm.<%= camelizedPluralName %> = result;
        });
      });
    }<% } %><% if (internationalization) { %>

    $translatePartialLoader.addPart('<%= slugifiedPluralName %>');
    $translate.refresh();<% } %>
  }
}());
