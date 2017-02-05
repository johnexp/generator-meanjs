// Item types service used to communicate Item types REST endpoints
(function () {
  'use strict';

  angular
    .module('<%= slugifiedPluralName %>')
    .factory('List<%= classifiedPluralName %>Service', List<%= classifiedPluralName %>Service);

  List<%= classifiedPluralName %>Service.$inject = ['$resource'];

  function List<%= classifiedPluralName %>Service($resource){
    var <%= classifiedPluralName %> = $resource('/api/<%= slugifiedPluralName %>/<%= if (logicalExclusion) { %>:active<% } %>', {}, {<% if (logicalExclusion) { %>
      getByState: {
        method: 'GET',
        params: {
          active: '@active'
        },
        isArray: true
      }<% } else { %>
      getAll: {
        method: 'GET',
        isArray: true
      }<% } %><% if (filterType == 'database') { %>,
      query: {
        method: 'POST',
        transformRequest: function (data) {
          return JSON.stringify(data);
        },
        isArray: true
      }<% } %>,
      delete: {
        method: 'DELETE',
        transformRequest: function (data) {
          return JSON.stringify(data);
        },
        isArray: true
      }
    });

    return<%= classifiedPluralName %>;
  }
}());
