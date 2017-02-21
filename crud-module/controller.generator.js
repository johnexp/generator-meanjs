'use strict';

var inflections = require('underscore.inflections'), s = require('underscore.string');

var controllerGenerator = module.exports;

controllerGenerator.generate = function (globalGenerator) {

  function getControllerFieldsProps() {
    var controllerAttrs = '';
    var controllerMethods = '';
    for (var field in globalGenerator.fieldsJson) {
      var fieldAttrs = globalGenerator.fieldsJson[field];
      if (fieldAttrs && fieldAttrs.hasOwnProperty('viewProps')) {
        controllerAttrs += getControllerFieldAttr(fieldAttrs);
        controllerMethods += getControllerFieldMethod(fieldAttrs);
      }
    }
    if (hasSelectWithSearch) {
      controllerAttrs += '\n    vm.selectOptSearchTerm = \'\';';
      controllerAttrs += '\n    vm.clearSelectOptSearchTerm = clearSelectOptSearchTerm;';
      controllerMethods += addClearSearchTerm();
    }
    if (modelHasEnum()) {
      controllerMethods += addGetEnumMethod();
    }
    globalGenerator.controllerAttrs = controllerAttrs;
    globalGenerator.controllerMethods = controllerMethods;
  }

  return getControllerFieldsProps();

  function getControllerFieldAttr(fieldProps) {
    if (fieldProps) {
      switch (fieldProps.viewProps.fieldType) {
        case 'checkbox':
          return getCheckboxControllerAttr(fieldProps);
        case 'radiobutton':
          return getRadiobuttonControllerAttr(fieldProps);
        case 'select':
        default:
          return '';
      }
    }
  }

  function getControllerFieldMethod(fieldProps) {
    if (fieldProps) {
      switch (fieldProps.viewProps.fieldType) {
        case 'checkbox':
          return getCheckboxControllerMethod(fieldProps);
        case 'select':
        default:
          return '';
      }
    }
  }

  function getCheckboxControllerAttr(fieldProps) {
    var checkboxControllerAttr = '';
    if (fieldProps.viewProps.checkboxType == 'multiple') {
      var pluralizedName = s(inflections.pluralize(fieldProps.viewProps.name)).camelize().value();
      var selectedName = 'selected' + s(pluralizedName).classify().value();
      var toggleSelectedName = 'toggleSelected' + s(inflections.pluralize(fieldProps.viewProps.name)).classify().value();
      checkboxControllerAttr += '\n    vm.' + pluralizedName + ' = getEnumValues(\'' + fieldProps.viewProps.name + '\');';
      checkboxControllerAttr += '\n    vm.' + selectedName + ' = [];';
      checkboxControllerAttr += '\n    vm.' + toggleSelectedName + ' = ' + toggleSelectedName + ';';
    }
    return checkboxControllerAttr;
  }

  function getRadiobuttonControllerAttr(fieldProps) {
    var radiobuttonControllerAttr = '';
    var pluralizedName = s(inflections.pluralize(fieldProps.viewProps.name)).camelize().value();
    radiobuttonControllerAttr += '\n    vm.' + pluralizedName + ' = getEnumValues(\'' + fieldProps.viewProps.name + '\');';
    return radiobuttonControllerAttr;
  }

  function getSelectItemControllerAttr(fieldProps) {
    var selectItemControllerAttr = '';
    var pluralizedName = s(inflections.pluralize(fieldProps.viewProps.name)).camelize().value();
    selectItemControllerAttr += '\n    vm.' + pluralizedName + ' = getEnumValues(\'' + fieldProps.viewProps.name + '\');';
    return selectItemControllerAttr;
  }

  function getCheckboxControllerMethod(fieldProps) {
    if (fieldProps) {
      var checkboxControllerMethod = '';
      if (fieldProps.viewProps.checkboxType == 'multiple') {
        var pluralizedName = s(inflections.pluralize(fieldProps.viewProps.name)).classify().value();
        var selectedName = 'selected' + pluralizedName;
        var toggleSelectedName = 'toggleSelected' + pluralizedName;
        checkboxControllerMethod += '\n    function ' + toggleSelectedName + '(value) {';
        checkboxControllerMethod += '\n      var idx = vm.' + selectedName + '.indexOf(value);';
        checkboxControllerMethod += '\n      if (idx > -1) {';
        checkboxControllerMethod += '\n        vm.' + selectedName + '.splice(idx, 1);';
        checkboxControllerMethod += '\n      } else {';
        checkboxControllerMethod += '\n        vm.' + selectedName + '.push(value);';
        checkboxControllerMethod += '\n      }';
        checkboxControllerMethod += '\n    }';
      }
      return checkboxControllerMethod;
    }
  }

  function modelHasEnum() {
    for (var field in globalGenerator.fieldsJson) {
      if (globalGenerator.fieldsJson[field].modelProps.hasOwnProperty('enum') || _.includes(globalGenerator.fieldsJson[field].modelProps.type, 'enum')) {
        return true;
      }
    }
    return false;
  }

  function hasSelectWithSearch() {
    for (var field in globalGenerator.fieldsJson) {
      if (globalGenerator.fieldsJson[field].viewProps.hasOwnProperty('search') && globalGenerator.fieldsJson[field].viewProps.search == true) {
        return true;
      }
    }
    return false;
  }

  function addGetEnumMethod() {
    var enumMethod = '\n\n    function getEnumValues(field) {' +
      '\n      return vm.' + globalGenerator.camelizedSingularName + '.getEnumResource().getEnumValues({' +
      '\n        field: field' +
      '\n      });' +
      '\n    }';
    return enumMethod;
  }

  function addClearSearchTerm() {
    var clearSearchTermMethod = '\n\n    function clearSelectOptSearchTerm() {' +
        '\n      vm.selectOptSearchTerm = \'\';' +
        '\n    }';
    return clearSearchTermMethod;
  }
}