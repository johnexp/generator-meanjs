'use strict';

var util = require('util'), inflections = require('underscore.inflections'), s = require('underscore.string'), _ = require('lodash'), mkdirp = require('mkdirp'), yeoman = require('yeoman-generator'), fs = require('fs');

var ModuleGenerator = yeoman.Base.extend({
  init: function () {
  },
  askForName: function () {
    var done = this.async();

    var prompts = [{
      type: 'input',
      name: 'name',
      default: '',
      message: 'What is the name of the module?'
    }];

    this.prompt(prompts, function (props) {
      this.name = props.name;

      this.slugifiedName = s(this.name).slugify().value();

      this.slugifiedPluralName = inflections.pluralize(this.slugifiedName);
      this.slugifiedSingularName = inflections.singularize(this.slugifiedName);

      this.camelizedPluralName = s(this.slugifiedPluralName).camelize().value();
      this.camelizedSingularName = s(this.slugifiedSingularName).camelize().value();

      this.classifiedPluralName = s(this.slugifiedPluralName).classify().value();
      this.classifiedSingularName = s(this.slugifiedSingularName).classify().value();

      this.humanizedPluralName = s(this.slugifiedPluralName).humanize().value();
      this.humanizedSingularName = s(this.slugifiedSingularName).humanize().value();

      this.capitalizedSingularName = s(this.humanizedSingularName).capitalize().value();

      done();
    }.bind(this));
  },
  askForModuleFolders: function () {
    var done = this.async();

    var prompts = [{
      type: 'checkbox',
      name: 'clientFolders',
      message: 'Which client-side folders would you like your module to include?',
      choices: [{
        value: 'addCSSFolder',
        name: 'css',
        checked: false
      }, {
        value: 'addImagesFolder',
        name: 'img',
        checked: false
      }, {
        value: 'addDirectivesFolder',
        name: 'directives',
        checked: false
      }, {
        value: 'addFiltersFolder',
        name: 'filters',
        checked: false
      }]
    }, {
      type: 'confirm',
      name: 'logicalExclusion',
      message: 'Does your module will have logical exclusion?',
      default: false
    }, {
      type: 'list',
      name: 'listType',
      message: 'What kind of list does your module have?',
      choices: [{
        value: 'simple',
        name: 'Simple (Just a list of items with a simple information)',
      }, {
        value: 'complex',
        name: 'Complex (Table with ordering and filtering per columns and pagination)',
      }]
    }, {
      type: 'list',
      name: 'filterType',
      message: 'What kind of filter does your module have?',
      choices: [{
        value: 'angular',
        name: 'Angular filter (Filter items at client side)',
      }, {
        value: 'database',
        name: 'Database filter (Filter items at server side)',
      }],
      default: 'angular',
      when: function (response) {
        return response.listType == 'complex';
      }
    }, {
      type: 'confirm',
      name: 'refilterActives',
      message: 'Do you want to refilter data when change you module activation state?',
      default: false,
      when: function (response) {
        return (!response.filterType || response.filterType == 'angular') && response.logicalExclusion == true;
      }
    }, {
      type: 'confirm',
      name: 'internationalization',
      message: 'Does your module will have Internationalization Support (i18n)?',
      default: false
    }, {
      type: 'confirm',
      name: 'generateEntityFields',
      message: 'Would you like to generate entity fields?',
      default: true
    }, {
      type: 'input',
      name: 'fieldsFileName',
      message: 'Considering that the file is in this directory. What the file name?',
      when: function (response) {
        return response.generateEntityFields == true;
      },
      validate: function (value) {
        try {
          JSON.parse(fs.readFileSync(value, 'utf-8'));
        } catch (exception) {
          return 'File not found';
        }
        return true;
      }
    }, {
      type: 'confirm',
      name: 'addMenuItems',
      message: 'Would you like to add the CRUD module links to a menu?',
      default: true
    }];

    this.prompt(prompts, function (props) {
      var clientFolders = {}, serverFolders = {};

      _.forEach(props.clientFolders, function (prop) {
        clientFolders[prop] = true;
      });
      _.forEach(props.serverFolders, function (prop) {
        serverFolders[prop] = true;
      });

      this.clientFolders = clientFolders;
      this.serverFolders = serverFolders;
      this.logicalExclusion = props.logicalExclusion;
      this.listType = props.listType;
      this.filterType = props.filterType != null ? props.filterType : 'angular';
      this.refilterActives = props.refilterActives;
      this.internationalization = props.internationalization;
      this.addMenuItems = props.addMenuItems;
      this.fieldsFileName = props.fieldsFileName;
      if (this.fieldsFileName) {
        var obj = JSON.parse(fs.readFileSync(this.fieldsFileName, 'utf8'));
        this.fieldsJson = obj;
        this.populateFields = [];
        this.setControllerProperties(this)();
        this.setModelFields();
        this.setViewProps(this)();
      }

      done();
    }.bind(this));
  },

  askForMenuId: function () {
    if (this.addMenuItems) {
      var done = this.async();

      var prompts = [{
        name: 'menuId',
        message: 'What is your menu identifier(Leave it empty and press ENTER for the default "topbar" menu)?',
        default: 'topbar'
      }];

      this.prompt(prompts, function (props) {
        this.menuId = props.menuId;

        done();
      }.bind(this));
    }
  },

  setModelFields: function () {
    if (this.fieldsFileName) {
      var model = '';
      this.populateFields = [];

      for (var field in this.fieldsJson) { // drink
        var fieldAttrs = this.fieldsJson[field];
        if (fieldAttrs.hasOwnProperty('modelProps')) {
          model += ',\n';
          model += '  ' + field + ': {';
          model += propToString(fieldAttrs.modelProps);
          model = model.slice(0, -1);
          model += '\n  }';
        }
        if (fieldAttrs.hasOwnProperty('populate')) {
          this.populateFields.push(fieldAttrs.populate);
        }
      }

      this.modelFields = model;
    }

    function propToString(modelProps) {
      var model = '';
      for (var modelProp in modelProps) { // type, required, validate, etc...
        if (typeof modelProps[modelProp] === 'object') {
          model += '\n    ' + modelProp + ': {';
          for (var propValue in modelProps[modelProp]) { // pattern
            model += '\n      ' + propValue + ': ' + modelProps[modelProp][propValue] + ',';
          }
          // removing last comma
          model = model.slice(0, -1);
          model += '\n    },';
        } else if (Array.isArray(modelProps[modelProp]) && modelProps[modelProp].length == 1) {
          model += propToString(modelProps[modelProp][0], model);
        } else {
          model += '\n    ' + modelProp + ': ' + modelProps[modelProp] + ',';
        }
      }
      return model;
    }

  },

  setControllerProperties: function (_this) {
    var setControllerFieldsProps = function () {
      var controllerAttrs = '';
      var controllerMethods = '';
      for (var field in _this.fieldsJson) {
        var fieldAttrs = _this.fieldsJson[field];
        if (fieldAttrs && fieldAttrs.hasOwnProperty('viewProps')) {
          controllerAttrs += getControllerFieldAttr(fieldAttrs);
          controllerMethods += getControllerFieldMethod(fieldAttrs);
        }
      }
      if (modelHasEnum()) {
        controllerMethods += addGetEnumMethod();
      }
      _this.controllerAttrs = controllerAttrs;
      _this.controllerMethods = controllerMethods;
    }

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
      for (var field in _this.fieldsJson) {
        if (_this.fieldsJson[field].modelProps.hasOwnProperty('enum') || _.includes(_this.fieldsJson[field].modelProps.type, 'enum')) {
          return true;
        }
      }
      return false;
    }

    function addGetEnumMethod() {
      var enumMethod = '\n\n    function getEnumValues(field) {' +
          '\n      return vm.' + _this.camelizedSingularName + '.getEnumResource().getEnumValues({' +
          '\n        field: field' +
          '\n      });' +
          '\n    }';
      return enumMethod;
    }

    return setControllerFieldsProps;
  },

  setViewProps: function (_this) {
    var setHtmlFields = function () {
      var fields = '';
      var countPairs = 0;
      var tagWasClosed = true;
      for (var field in _this.fieldsJson) {
        var fieldAttrs = _this.fieldsJson[field];
        if (fieldAttrs && fieldAttrs.hasOwnProperty('viewProps')) {
          if (countPairs == 0 || isSingleFieldLine(fieldAttrs)) {
            if (tagWasClosed == false) {
              fields += '\n    </div>';
            }
            fields += getInputRowOppening();
            tagWasClosed = false;
          }
          fields += getHtmlField(fieldAttrs);
          countPairs++;
          if (countPairs == 2 || isSingleFieldLine(fieldAttrs)) {
            fields += '\n    </div>';
            countPairs = 0;
            tagWasClosed = true;
          }
        }
      }
      if (tagWasClosed == false) {
        fields += '\n    </div>';
      }
      _this.formFields = fields;
    }

    function getHtmlField(fieldProps) {
      switch (fieldProps.viewProps.fieldType) {
        case 'text':
        case 'number':
          return getInput(fieldProps);
        case 'checkbox':
          return getCheckbox(fieldProps);
        case 'select':
          return getSelectOption(fieldProps);
        case 'switch':
          return getSwitch(fieldProps);
        case 'radiobutton':
          return getRadiobutton(fieldProps);
        default:
          return '';
      }
    }

    function getInput(fieldProps) {
      var inputProps = getInputProps(fieldProps);
      var messages = Object.keys(inputProps.messages).length > 0 && inputProps.messages.constructor === Object ?
      '\n        <div ng-messages="vm.form.' + _this.camelizedSingularName + 'Form.' + fieldProps.viewProps.name + '.$error">' +
      (inputProps.messages.hasOwnProperty('patternMessage') ? inputProps.messages.patternMessage : '') +
      (inputProps.messages.hasOwnProperty('maxlengthMessage') ? inputProps.messages.maxlengthMessage : '') +
      (inputProps.messages.hasOwnProperty('minlengthMessage') ? inputProps.messages.minlengthMessage : '') +
      (inputProps.messages.hasOwnProperty('minMessage') ? inputProps.messages.minMessage : '') +
      (inputProps.messages.hasOwnProperty('maxMessage') ? inputProps.messages.maxMessage : '') +
      (inputProps.messages.hasOwnProperty('requiredMessage') ? inputProps.messages.requiredMessage : '') +
      '\n        </div>' : '';

      return '\n      <md-input-container flex>' +
          '\n        <label for="' + fieldProps.viewProps.name + '" translate>' + fieldProps.viewProps.displayName + '</label>' +
          getIconTag(fieldProps.viewProps, true) +
          '\n        <input name="' + fieldProps.viewProps.name + '" type="' +
          fieldProps.viewProps.fieldType + '" ng-model="vm.' + _this.camelizedSingularName + '.'
          + fieldProps.viewProps.name + '" id="' + fieldProps.viewProps.name + '"' +
          inputProps.props.patternProp +
          inputProps.props.maxlengthProp +
          inputProps.props.minlengthProp +
          inputProps.props.minProp +
          inputProps.props.maxProp +
          inputProps.props.requiredProp + '>' +
          messages +
          '\n      </md-input-container>';
    }

    function getCheckbox(fieldProps) {
      var disabled = fieldProps.viewProps.hasOwnProperty('disabled') ? ' ng-disabled="' + fieldProps.viewProps.disabled + '"' : '';
      var checkboxes = '';

      if (fieldProps.viewProps.hasOwnProperty('checkboxType') && fieldProps.viewProps.checkboxType == 'multiple') {
        checkboxes += '\n      <p class="md-subhead" flex="100">' + getIconTag(fieldProps.viewProps, false) + fieldProps.viewProps.displayName + '</p>';
        var selectedName = 'selected' + s(inflections.pluralize(fieldProps.viewProps.name)).classify().value();
        var toggleSelectedName = 'Selected' + s(inflections.pluralize(fieldProps.viewProps.name)).classify().value();
        var pluralizedName = s(inflections.pluralize(fieldProps.viewProps.name)).camelize().value();
        var humanizedName = s(inflections.pluralize(fieldProps.viewProps.name)).humanize().value();

        checkboxes += '\n      <div flex="' + fieldProps.viewProps.colSize + '" ng-repeat="' + fieldProps.viewProps.name + ' in vm.' + pluralizedName + '">';
        checkboxes += '\n        <md-checkbox name="' + selectedName + '[]"' +
            ' value="{{' + fieldProps.viewProps.name + '}}"' +
            ' ng-checked="vm.' + selectedName + '.indexOf(' + fieldProps.viewProps.name + ') > -1"' +
            ' ng-click="vm.toggle' + toggleSelectedName + '(' + fieldProps.viewProps.name + ')"' +
            disabled + '>' +
            '\n          <span>' + humanizedName + '</span>' +
            '\n        </md-checkbox>';
        checkboxes += '\n      </div>';
      } else {
        checkboxes += '\n      <md-checkbox ng-model="vm.' + _this.camelizedSingularName + '.' + fieldProps.viewProps.name + '"' + disabled + '>' +
            '\n        <span>' + fieldProps.viewProps.displayName + '</span>' +
            '\n      </md-checkbox>';
      }
      return checkboxes;
    }

    function getSwitch(fieldProps) {
      var disabled = fieldProps.viewProps.hasOwnProperty('disabled') ? ' ng-disabled="' + fieldProps.viewProps.disabled + '"' : '';
      var switchee = '\n      <md-switch' + disabled + ' aria-label="' + fieldProps.viewProps.displayName + '" ng-model="vm.' + _this.camelizedSingularName + '.' + fieldProps.viewProps.name + '">' +
          '\n        ' + fieldProps.viewProps.displayName +
          '\n      </md-switch>';
      return switchee;
    }

    function getRadiobutton(fieldProps) {
      var pluralizedName = s(inflections.pluralize(fieldProps.viewProps.name)).camelize().value();
      var disabled = fieldProps.viewProps.hasOwnProperty('disabled') ? ' ng-disabled="' + fieldProps.viewProps.disabled + '"' : '';
      var radio = '\n      <md-radio-group ng-model="vm.' + _this.camelizedSingularName + '.' + fieldProps.viewProps.name + '">';
      radio += '\n        <md-radio-button ng-repeat="' + fieldProps.viewProps.name + ' in vm.' + pluralizedName + '" ng-value="' + fieldProps.viewProps.name + '"' + disabled + '>' +
        '\n          {{' + fieldProps.viewProps.name + '}}' +
        '\n        </md-radio-button>';
      radio += '\n      </md-radio-group>';
      return radio;
    }

    function getSelectOption(fieldProps) {
      var inputProps = getInputProps(fieldProps);
      var hasSearch = fieldProps.viewProps.hasOwnProperty('search') && fieldProps.viewProps.search == true;

      var searchTag = hasSearch ?
      '\n          <md-select-header class="select-search-header">' +
      '\n            <input ng-model="vm.selectOptSearchTerm" type="search" placeholder="{{ \'Search for a ' + fieldProps.viewProps.displayName + '...\' | translate }}" class="select-search-searchbox md-text">' +
      '\n          </md-select-header>' : '';

      var emptyOption = !fieldProps.viewProps.hasOwnProperty('required') || fieldProps.viewProps.required == false ?
          '\n          <md-option><em translate>None</em></md-option>' : '';

      var messages = Object.keys(inputProps.messages).length > 0 && inputProps.messages.constructor === Object ?
      '\n        <div ng-messages="vm.form.' + _this.camelizedSingularName + 'Form.' + fieldProps.viewProps.name + '.$error">' +
      (inputProps.messages.hasOwnProperty('requiredMessage') ? inputProps.messages.requiredMessage : '') +
      '\n        </div>' : '';

      return '\n      <md-input-container flex>' +
          '\n        <label>' + fieldProps.viewProps.displayName + '</label>' +
          getIconTag(fieldProps.viewProps, true) +
          '\n        <md-select ng-model="vm.' + _this.camelizedSingularName + '.' + fieldProps.viewProps.name + '"' + (hasSearch ? ' md-on-close="vm.clearSelectOptSearchTerm()" data-md-container-class="select-search"' : '') +
          inputProps.props.multipleProp +
          inputProps.props.requiredProp +
          '>' +
          searchTag +
          emptyOption +
          getOptGroup(fieldProps) +
          '\n        </md-select>' +
          messages +
          '\n      </md-input-container>';
    }

    function getOptGroup(fieldProps) {
      var pluralizedName = inflections.pluralize(fieldProps.viewProps.name);
      var pluralizedDisplayNameName = inflections.pluralize(fieldProps.viewProps.displayName);

      if (fieldProps.viewProps.hasOwnProperty('required') && fieldProps.viewProps.required == true) {
        return '\n          <md-optgroup label="' + pluralizedDisplayNameName + '">' +
            '\n            <md-option ng-value="' + fieldProps.viewProps.name + '._id" ng-selected="vm.' + _this.camelizedSingularName + '.' + fieldProps.viewProps.name + '.indexOf(' + fieldProps.viewProps.name + '._id) > -1" ng-repeat="' + fieldProps.viewProps.name + ' in vm.' + pluralizedName + ' | filter: vm.selectOptSearchTerm">' +
            '\n              {{' + fieldProps.viewProps.name + '.' + fieldProps.viewProps.objectIdDisplayName + '}}' +
            '\n            </md-option>' +
            '\n          </md-optgroup>';
      } else {
        return '\n          <md-option ng-value="' + fieldProps.viewProps.name + '._id" ng-selected="vm.' + _this.camelizedSingularName + '.' + fieldProps.viewProps.name + '.indexOf(' + fieldProps.viewProps.name + '._id) > -1" ng-repeat="' + fieldProps.viewProps.name + ' in vm.' + pluralizedName + ' | filter: vm.selectOptSearchTerm">' +
            '\n            {{' + fieldProps.viewProps.name + '.' + fieldProps.viewProps.objectIdDisplayName + '}}' +
            '\n          </md-option>';
      }
    }

    function getIconTag(viewProps, ident) {
      if (viewProps.hasOwnProperty('icon')) {
        if (ident) {
          return '\n        <md-icon md-font-set="material-icons">' + viewProps.icon + '</md-icon>';
        } else {
          return '<md-icon md-font-set="material-icons">' + viewProps.icon + '</md-icon> ';
        }
      }
      return '';
    }

    function getInputRowOppening() {
      return '\n    <div layout-gt-sm="row" layout-wrap>';
    }

    function getInputProps(fieldProps) {
      var messages = {};
      if (fieldProps.viewProps.hasOwnProperty('patternMessage')) {
        messages.patternMessage = '\n          <p ng-message="pattern" translate>' + fieldProps.viewProps.patternMessage + '</p>';
      }
      if (fieldProps.viewProps.hasOwnProperty('maxlengthMessage')) {
        messages.maxlengthMessage = '\n          <p ng-message="md-maxlength" translate>' + fieldProps.viewProps.maxlengthMessage + '</p>';
      }
      if (fieldProps.viewProps.hasOwnProperty('minlengthMessage')) {
        messages.minlengthMessage = '\n          <p ng-message="minlength" translate>' + fieldProps.viewProps.minlengthMessage + '</p>';
      }
      if (fieldProps.viewProps.hasOwnProperty('minMessage')) {
        messages.minMessage = '\n          <p ng-message="min" translate>' + fieldProps.viewProps.minMessage + '</p>';
      }
      if (fieldProps.viewProps.hasOwnProperty('maxMessage')) {
        messages.maxMessage = '\n          <p ng-message="max" translate>' + fieldProps.viewProps.maxMessage + '</p>';
      }
      if (fieldProps.viewProps.hasOwnProperty('requiredMessage')) {
        messages.requiredMessage = '\n          <p ng-message="required" translate>' + fieldProps.viewProps.requiredMessage + '</p>';
      }
      return {
        props: {
          patternProp: fieldProps.viewProps.hasOwnProperty('pattern') ? ' pattern="' + fieldProps.viewProps.pattern + '"' : '',
          maxlengthProp: fieldProps.viewProps.hasOwnProperty('maxlength') ? ' md-maxlength="' + fieldProps.viewProps.maxlength + '"' : '',
          minlengthProp: fieldProps.viewProps.hasOwnProperty('minlength') ? ' minlength="' + fieldProps.viewProps.minlength + '"' : '',
          minProp: fieldProps.viewProps.hasOwnProperty('min') ? ' min="' + fieldProps.viewProps.min + '"' : '',
          maxProp: fieldProps.viewProps.hasOwnProperty('max') ? ' max="' + fieldProps.viewProps.max + '"' : '',
          requiredProp: fieldProps.viewProps.hasOwnProperty('required') && fieldProps.viewProps.required == true ? ' required' : '',
          multipleProp: fieldProps.viewProps.hasOwnProperty('multiple') && fieldProps.viewProps.multiple == true ? ' multiple' : ''
        },
        messages: messages
      };
    }

    function isSingleFieldLine(fieldAttrs) {
      return fieldAttrs != null &&
          fieldAttrs.hasOwnProperty('viewProps') &&
          ((fieldAttrs.viewProps.fieldType == 'checkbox' &&
          fieldAttrs.viewProps.checkboxType == 'multiple') ||
          fieldAttrs.viewProps.fieldType == 'switch' ||
          fieldAttrs.viewProps.fieldType == 'radiobutton');
    }

    return setHtmlFields;
  },

  renderModule: function () {
    // Create module folder
    mkdirp.sync('modules/' + this.slugifiedPluralName);

    // Create module supplemental folders
    if (this.clientFolders.addCSSFolder) {
      mkdirp.sync('modules/' + this.slugifiedPluralName + '/client/css');
    }

    if (this.clientFolders.addImagesFolder) {
      mkdirp.sync('modules/' + this.slugifiedPluralName + '/client/img');
    }

    if (this.clientFolders.addDirectivesFolder) {
      mkdirp.sync('modules/' + this.slugifiedPluralName + '/client/directives');
    }

    if (this.clientFolders.addFiltersFolder) {
      mkdirp.sync('modules/' + this.slugifiedPluralName + '/client/filters');
    }

    if (this.internationalization) {
      mkdirp.sync('modules/' + this.slugifiedPluralName + '/client/i18n');
      this.template('client/i18n/_.en_US.json', 'modules/' + this.slugifiedPluralName + '/client/i18n/' + this.slugifiedPluralName + '.en_US.json');
      this.template('client/i18n/_.pt_BR.json', 'modules/' + this.slugifiedPluralName + '/client/i18n/' + this.slugifiedPluralName + '.pt_BR.json');
    }

    // Render angular module files
    this.template('client/config/_.client.routes.js', 'modules/' + this.slugifiedPluralName + '/client/config/' + this.slugifiedPluralName + '.client.routes.js');
    this.template('client/controllers/_.client.controller.js', 'modules/' + this.slugifiedPluralName + '/client/controllers/' + this.slugifiedPluralName + '.client.controller.js');
    this.template('client/controllers/_.list.client.controller.js', 'modules/' + this.slugifiedPluralName + '/client/controllers/list-' + this.slugifiedPluralName + '.client.controller.js');
    this.template('client/services/_.client.service.js', 'modules/' + this.slugifiedPluralName + '/client/services/' + this.slugifiedPluralName + '.client.service.js');
    this.template('client/services/_.list.client.service.js', 'modules/' + this.slugifiedPluralName + '/client/services/list-' + this.slugifiedPluralName + '.client.service.js');

    // Render angular tests
    this.template('tests/client/_.client.controller.tests.js', 'modules/' + this.slugifiedPluralName + '/tests/client/' + this.slugifiedPluralName + '.client.controller.tests.js');
    this.template('tests/client/_.client.routes.tests.js', 'modules/' + this.slugifiedPluralName + '/tests/client/' + this.slugifiedPluralName + '.client.routes.tests.js');
    this.template('tests/client/_.list.client.controller.tests.js', 'modules/' + this.slugifiedPluralName + '/tests/client/list-' + this.slugifiedPluralName + '.client.controller.tests.js');

    // Render angular module views
    this.template('client/views/_.form.client.view.html', 'modules/' + this.slugifiedPluralName + '/client/views/form-' + this.slugifiedSingularName + '.client.view.html');
    this.template('client/views/_.view.client.view.html', 'modules/' + this.slugifiedPluralName + '/client/views/view-' + this.slugifiedSingularName + '.client.view.html');
    this.template('client/views/_.list.client.view.html', 'modules/' + this.slugifiedPluralName + '/client/views/list-' + this.slugifiedPluralName + '.client.view.html');

    // Render menu configuration
    if (this.addMenuItems) {
      this.template('client/config/_.client.config.js', 'modules/' + this.slugifiedPluralName + '/client/config/' + this.slugifiedPluralName + '.client.config.js');
    }

    // Render angular module definition
    this.template('client/_.client.module.js', 'modules/' + this.slugifiedPluralName + '/client/' + this.slugifiedPluralName + '.client.module.js');

    // Render e2e tests
    this.template('tests/e2e/_.e2e.tests.js', 'modules/' + this.slugifiedPluralName + '/tests/e2e/' + this.slugifiedPluralName + '.e2e.tests.js');

    // Render server module config
    this.template('server/config/_.server.config.js', 'modules/' + this.slugifiedPluralName + '/server/config/' + this.slugifiedPluralName + '.server.config.js');

    // Render express module files
    this.template('server/controllers/_.server.controller.js', 'modules/' + this.slugifiedPluralName + '/server/controllers/' + this.slugifiedPluralName + '.server.controller.js');
    this.template('server/models/_.server.model.js', 'modules/' + this.slugifiedPluralName + '/server/models/' + this.slugifiedSingularName + '.server.model.js');
    this.template('server/routes/_.server.routes.js', 'modules/' + this.slugifiedPluralName + '/server/routes/' + this.slugifiedPluralName + '.server.routes.js');

    // Render express policy
    this.template('server/policies/_.server.policy.js', 'modules/' + this.slugifiedPluralName + '/server/policies/' + this.slugifiedPluralName + '.server.policy.js');

    // Add express module tests
    this.template('tests/server/_.server.model.tests.js', 'modules/' + this.slugifiedPluralName + '/tests/server/' + this.slugifiedSingularName + '.server.model.tests.js');
    this.template('tests/server/_.server.routes.tests.js', 'modules/' + this.slugifiedPluralName + '/tests/server/' + this.slugifiedSingularName + '.server.routes.tests.js');
  }

});

module.exports = ModuleGenerator;
