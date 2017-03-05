(function () {
  'use strict';

  angular
    .module('<%= slugifiedPluralName %>')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('<%= camelizedPluralName %>', {
        abstract: true,
        parent: 'home',
        url: '<%= slugifiedPluralName %>',
        template: '<ui-view/>'
      })
      .state('<%= camelizedPluralName %>.list', {
        url: '',
        templateUrl: '/modules/<%= slugifiedPluralName %>/client/views/list-<%= slugifiedPluralName %>.client.view.html',
        controller: '<%= classifiedPluralName %>ListController',
        controllerAs: 'vm',
        resolve: {
          <%= camelizedSingularName %>Resolve: new<%= classifiedSingularName %>
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: '<%= humanizedPluralName %> List'
        }
      })
      .state('<%= camelizedPluralName %>.create', {
        url: '/create',
        templateUrl: '/modules/<%= slugifiedPluralName %>/client/views/form-<%= slugifiedSingularName %>.client.view.html',
        controller: '<%= classifiedPluralName %>Controller',
        controllerAs: 'vm',
        resolve: {
          <%= camelizedSingularName %>Resolve: new<%= classifiedSingularName %>
        },
        data: {
          roles: ['admin'],
          pageTitle: '<%= humanizedPluralName %> Create'
        }
      })
      .state('<%= camelizedPluralName %>.edit', {
        url: '/:<%= camelizedSingularName %>Id/edit',
        templateUrl: '/modules/<%= slugifiedPluralName %>/client/views/form-<%= slugifiedSingularName %>.client.view.html',
        controller: '<%= classifiedPluralName %>Controller',
        controllerAs: 'vm',
        resolve: {
          <%= camelizedSingularName %>Resolve: get<%= classifiedSingularName %>
        },
        data: {
          roles: ['admin'],
          pageTitle: 'Edit <%= humanizedSingularName %> {{ <%= slugifiedSingularName %>Resolve.name }}'
        }
      })
      .state('<%= camelizedPluralName %>.view', {
        url: '/:<%= camelizedSingularName %>Id',
        templateUrl: '/modules/<%= slugifiedPluralName %>/client/views/view-<%= slugifiedSingularName %>.client.view.html',
        controller: '<%= classifiedPluralName %>Controller',
        controllerAs: 'vm',
        resolve: {
          <%= camelizedSingularName %>Resolve: get<%= classifiedSingularName %>
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: '<%= humanizedSingularName %> {{ <%= slugifiedSingularName %>Resolve.name }}'
        }
      });
  }

  get<%= classifiedSingularName %>.$inject = ['$stateParams', '<%= classifiedPluralName %>Service'];

  function get<%= classifiedSingularName %>($stateParams, <%= classifiedPluralName %>Service) {
    return <%= classifiedPluralName %>Service.get({
      <%= camelizedSingularName %>Id: $stateParams.<%= camelizedSingularName %>Id
    }).$promise;
  }

  new<%= classifiedSingularName %>.$inject = ['<%= classifiedPluralName %>Service'];

  function new<%= classifiedSingularName %>(<%= classifiedPluralName %>Service) {
    return new <%= classifiedPluralName %>Service();
  }
}());
