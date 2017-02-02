// Item types service used to communicate Item types REST endpoints
(function () {
  'use strict';

  angular
    .module('<%= slugifiedPluralName %>')
    .factory('List<%= classifiedPluralName %>Service', List<%= classifiedPluralName %>Service);

  List<%= classifiedPluralName %>Service.$inject = ['$resource'];

  function List<%= classifiedPluralName %>Service($resource) {
    var <%= classifiedPluralName %> = $resource('/api/<%= slugifiedPluralName %>/:active', {
      active: '@active'
    }, {
      query: {
        method: 'GET',
        params: {
          active: '@active'
        },
        isArray: true
      }
    });

    return <%= classifiedPluralName %>;
  }
}());
