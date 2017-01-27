(function () {
  'use strict';

  angular
    .module('<%= slugifiedPluralName %>')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: '<%= humanizedPluralName %>',
      state: '<%= camelizedPluralName %>',
      type: 'dropdown',
      icon: 'help',
      roles: ['user', 'admin']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', '<%= camelizedPluralName %>', {
      title: 'List <%= humanizedPluralName %>',
      state: '<%= camelizedPluralName %>.list',
      roles: ['user', 'admin']
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', '<%= camelizedPluralName %>', {
      title: 'Create <%= humanizedSingularName %>',
      state: '<%= camelizedPluralName %>.create',
      roles: ['admin']
    });
  }
}());
