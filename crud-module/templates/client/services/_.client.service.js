// <%= humanizedPluralName %> service used to communicate <%= humanizedPluralName %> REST endpoints
(function () {
  'use strict';

  angular
    .module('<%= slugifiedPluralName %>')
    .factory('<%= classifiedPluralName %>Service', <%= classifiedPluralName %>Service);

  <%= classifiedPluralName %>Service.$inject = ['$resource', '$log'];

  function <%= classifiedPluralName %>Service($resource, $log) {
    var <%= classifiedPluralName %> = $resource('/api/<%= slugifiedSingularName %>/:<%= camelizedSingularName %>Id', {
      <%= camelizedSingularName %>Id: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(<%= classifiedPluralName %>.prototype, {
      createOrUpdate: function () {
        var <%= camelizedSingularName %> = this;
        return createOrUpdate(<%= camelizedSingularName %>);
      }
    });

    return <%= classifiedPluralName %>;

    function createOrUpdate(<%= camelizedSingularName %>) {
      if (<%= camelizedSingularName %>._id) {
        return <%= camelizedSingularName %>.$update(onSuccess, onError);
      } else {
        return <%= camelizedSingularName %>.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(<%= camelizedSingularName %>) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
}());
