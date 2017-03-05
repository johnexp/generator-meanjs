(function () {
  'use strict';

  angular
    .module('<%= slugifiedPluralName %>')
    .controller('<%= classifiedPluralName %>ListController', <%= classifiedPluralName %>ListController);

  <%= classifiedPluralName %>ListController.$inject = ['<%= camelizedSingularName %>Resolve'<% if (internationalization) { %>, '$translatePartialLoader', '$translate'<% } %><% if (listType == 'complex') { %>, 'PaginationService'<% } %><% if ((filterType == 'angular' && listType == 'complex') || filterType == 'database') { %>, '$filter'<% } %>, 'Toast', 'DialogService', '$log'];

  function <%= classifiedPluralName %>ListController(<%= camelizedSingularName %><% if (internationalization) { %>, $translatePartialLoader, $translate<% } %><% if (listType == 'complex') { %>, PaginationService<% } %><% if ((filterType == 'angular' && listType == 'complex') || filterType == 'database') { %>, $filter<% } %>, Toast, DialogService, $log) {
    var vm = this;
    vm.<%= camelizedSingularName %>Service = <%= camelizedSingularName %>;
    <%_ if (listType == 'complex') { _%>
    vm.pagination = PaginationService.getPagination();
    vm.pagination.sort = 'name';
    <%_ } _%>
    <%_ if (filterType == 'angular') { if (logicalExclusion && refilterActives) { _%>
    vm.all<%= classifiedPluralName %> = <%= camelizedSingularName %>.getListResource().getByState({ active: true }, function() {
      <%_ if (filterType == 'angular' && listType == 'complex') { _%>
      filter();
      <%_ } else { _%>
      vm.<%= camelizedPluralName %> = <% if (filterType == 'database') { %>{}<% } else { %>vm.all<%= classifiedPluralName %><% } %>;
      <%_ } _%>
    });
    <%_ } else { _%>
    vm.all<%= classifiedPluralName %> = <%= camelizedSingularName %>.getListResource().getAll(function() {
      <%_ if (filterType == 'angular' && listType == 'complex') { _%>
      filter();
      <%_ } else { _%>
      vm.<%= camelizedPluralName %> = <% if (filterType == 'database') { %>{}<% } else { %>vm.all<%= classifiedPluralName %><% } %>;
      <%_ } _%>
    });
    <%_ }} _%>
    vm.<%= camelizedSingularName %>Filter = {<% if (logicalExclusion) { %> active: true <% } %>};
    <%_ if (filterType == 'angular' && refilterActives) { _%>
    vm.refilter = refilter;
    <%_ } _%>
    <%_ if (logicalExclusion) { _%>
    vm.changeState = changeState;
    <%_ } else { _%>
    vm.remove = remove;
    <%_ } _%>
    <%_ if ((filterType == 'angular' && listType == 'complex') || filterType == 'database') { _%>
    vm.filter = filter;
    <%_ } _%>
    <%_ if (filterType == 'angular') { _%>
    <%_ if (listType == 'complex') { _%>

    function filter() {
      angular.forEach(vm.<%= camelizedSingularName %>Filter, function (value, key) {
        if (value === '') {
          delete vm.<%= camelizedSingularName %>Filter[key];
        }
      });
      vm.<%= camelizedPluralName %> = $filter('filter')(vm.all<%= classifiedPluralName %>, vm.<%= camelizedSingularName %>Filter);
    }
    <%_ } _%>
    <%_ if (refilterActives) { _%>

    function refilter() {
      vm.all<%= classifiedPluralName %> = <%= camelizedSingularName %>.getListResource().getByState({ active: vm.<%= camelizedSingularName %>Filter.active }, function () {
        vm.<%= camelizedPluralName %> = vm.all<%= classifiedPluralName %>;
      });
    }
    <%_ } _%>
    <%_ } _%>
    <%_ if (logicalExclusion) { _%>

    // Change activation state of an existing <%= humanizedSingularName %>
    function changeState(ev, <%= camelizedSingularName %>) {
      DialogService.showConfirmInactivation(ev, function (option) {
        if (option === true) {
          vm.<%= camelizedSingularName %>Service.$remove({ <%= camelizedSingularName %>Id: <%= camelizedSingularName %>._id }, function () {
            <%_ if (refilterActives) { _%>
            refilter();
            <%_ } else if (filterType == 'angular' && listType == 'simple') { _%>
            vm.all<%= classifiedPluralName %> = vm.<%= camelizedSingularName %>Service.getListResource().getAll();
            vm.<%= camelizedPluralName %> = vm.all<%= classifiedPluralName %>
            <%_ } else { _%>
            <%= camelizedSingularName %>.active = !<%= camelizedSingularName %>.active;
            filter();
            <%_ } _%>
          }, function (res) {
            Toast.genericErrorMessage();
            $log.error(res.data.message);
          });
        }
      });
    }
    <%_ } else { _%>

    // Remove existing <%= humanizedSingularName %>
    function remove(ev, <%= camelizedSingularName %>) {
      DialogService.showConfirmDeletion(ev, function (option) {
        if (option === true) {
          vm.<%= camelizedSingularName %>Service.$remove({ <%= camelizedSingularName %>Id: <%= camelizedSingularName %>._id }, function () {
            <%_ if (refilterActives) { _%>
            refilter();
            <%_ } else if (filterType == 'angular' && listType == 'simple') { _%>
            vm.all<%= classifiedPluralName %> = vm.<%= camelizedSingularName %>Service.getListResource().getAll();
            vm.<%= camelizedPluralName %> = vm.all<%= classifiedPluralName %>;
            <%_ } else { _%>;
            filter();
            <%_ } _%>
          }, function (res) {
            Toast.genericErrorMessage();
            $log.error(res.data.message);
          });
        }
      });
    }
    <%_ } _%>
    <%_ if (filterType == 'database') { _%>

    function filter() {
      <%= camelizedSingularName %>.getListResource().query({ filter: vm.<%= camelizedSingularName %>Filter, queryCount: true }, function (result) {
        vm.pagination.queryLimit = result[0];
        PaginationService.setOffset(vm.pagination);
        vm.queryPromise = <%= camelizedSingularName %>.getListResource().query({ filter: vm.<%= camelizedSingularName %>Filter, pagination: vm.pagination }, function (result) {
          vm.<%= camelizedPluralName %> = result;
        });
      });
    }
    <%_ } _%>
    <%_ if (internationalization) { _%>

    $translatePartialLoader.addPart('<%= slugifiedPluralName %>');
    $translate.refresh();
    <%_ } _%>
  }
}());
