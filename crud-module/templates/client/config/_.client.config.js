(function () {
  'use strict';

  angular
    .module('<%= slugifiedPluralName %>')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('<%= menuId %>', {
      title: '<%= humanizedPluralName %>',
      state: '<%= camelizedPluralName %>',
      type: 'dropdown',
      icon: 'help',
      roles: ['user', 'admin']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('<%= menuId %>', '<%= camelizedPluralName %>', {
      title: 'List <%= humanizedPluralName %>',
      state: '<%= camelizedPluralName %>.list',
      roles: ['user', 'admin']
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('<%= menuId %>', '<%= camelizedPluralName %>', {
      title: 'Create <%= humanizedSingularName %>',
      state: '<%= camelizedPluralName %>.create',
      roles: ['admin']
    });
    <% if (specifications.logicalExclusion == true) { %>
    var thisIsATest = "Successfull";
    <% } %>
    <% if (specifications.internacionalization == true) { %>
    var thisIsATest2 = "Internacionalization";
    <% } %>
  }
}());
