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
  },
  printModelFields: function () {
    var model = '';
    if (this.fieldsFileName) {
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

    return model;
  },
  getHtmlFields: function () {
    var fields = '';
    var countPairs = 0;
    var tagWasClosed = true;
    for (var field in this.fieldsJson) {
      var fieldAttrs = this.fieldsJson[field];
      if (fieldAttrs && fieldAttrs.hasOwnProperty('viewProps')) {
        if (countPairs == 0 || this.isCheckBoxMultiple(fieldAttrs)) {
          if (tagWasClosed == false) {
            fields += '\n    </div>';
          }
          fields += this.getInputRowOppening();
          tagWasClosed = false;
        }
        fields += this.getHtmlField(fieldAttrs);
        countPairs++;
        if (countPairs == 2 || this.isCheckBoxMultiple(fieldAttrs)) {
          fields += '\n    </div>';
          countPairs = 0;
          tagWasClosed = true;
        }
      }
    }
    if (tagWasClosed == false) {
      fields += '\n    </div>';
    }
    return fields;
  },
  getHtmlField: function (fieldProps) {
    if (fieldProps && fieldProps.hasOwnProperty('viewProps')) {
      switch (fieldProps.viewProps.fieldType) {
        case 'text':
        case 'number':
          return this.getInput(fieldProps);
        case 'checkbox':
          return this.getCheckbox(fieldProps);
        default:
          return '';
      }
    }
    return '';
  },
  getInput: function (fieldProps) {
    if (fieldProps) {
      var inputProps = this.getInputProps(fieldProps);
      return '\n      <md-input-container flex>' +
      '\n        <label for="' + fieldProps.viewProps.name + '" translate>' + fieldProps.viewProps.displayName + '</label>' +
      this.getIconTag(fieldProps.viewProps) +
      '\n        <input name="' + fieldProps.viewProps.name + '" type="' + fieldProps.viewProps.fieldType + '" ng-model="vm.' + this.camelizedSingularName + '.' + fieldProps.viewProps.name + '" id="' + fieldProps.viewProps.name + '"' +
      inputProps.props.patternProp +
      inputProps.props.maxlengthProp +
      inputProps.props.minlengthProp +
      inputProps.props.minProp +
      inputProps.props.maxProp +
      inputProps.props.requiredProp + '>' +
      '\n        <div ng-messages="vm.form.' + this.camelizedSingularName + 'Form.name.$error">' +
      inputProps.messages.patternMessage +
      inputProps.messages.maxlengthMessage +
      inputProps.messages.minlengthMessage +
      inputProps.messages.minMessage +
      inputProps.messages.maxMessage +
      inputProps.messages.requiredMessage +
      '\n        </div>' +
      '\n      </md-input-container>';
    }
    return '';
  },
  getCheckbox: function (fieldProps) {
    if (fieldProps) {
      var disabled = fieldProps.viewProps.hasOwnProperty('disabled') ? ' ng-disabled="' + fieldProps.viewProps.disabled + '"' : '';
      var checkboxes = '';

      if (fieldProps.viewProps.checkboxType == 'multiple') {
        checkboxes += '\n      <p class="md-subhead" flex="100">' + fieldProps.viewProps.displayName + '</p>';
        var selectedName = 'selected' + s(inflections.singularize(fieldProps.viewProps.name)).classify().value();
        var toggleSelectedName = 'Selected' + s(inflections.singularize(fieldProps.viewProps.name)).classify().value();

        _.forEach(JSON.parse(fieldProps.viewProps.options), function (name, value) {
          checkboxes += '\n      <div flex="' + fieldProps.viewProps.colSize + '">';
          checkboxes += '\n        <md-checkbox name="' + selectedName + '[]"' +
            ' value="' + value + '"' +
            ' ng-checked="vm.' + selectedName + '.indexOf(\'' + value + '\') > -1"' +
            ' ng-click="vm.toggle' + toggleSelectedName + '(\'' + value + '\')"' +
            disabled + '>' +
            '\n          <span translate>' + name + '</span>' +
            '\n        </md-checkbox>';
          checkboxes += '\n      </div>';
        });
      } else {
        checkboxes += '\n      <md-checkbox ng-model="vm.' + this.camelizedSingularName + '.' + fieldProps.viewProps.name + '"' + disabled + '>' +
          '\n        <span translate>' + fieldProps.viewProps.displayName + '</span>' +
          '\n      </md-checkbox>';
      }
      return checkboxes;
    }
  },
  getIconTag: function (viewProps) {
    if (viewProps && viewProps.hasOwnProperty('icon')) {
       return '\n        <md-icon md-font-set="material-icons">' + viewProps.icon + '</md-icon>';
    }
    return '';
  },
  getInputRowOppening: function () {
    return '\n    <div layout-gt-sm="row" layout-wrap>';
  },
  getInputProps: function (fieldProps) {
    if (fieldProps) {
      return {
        props: {
          patternProp: fieldProps.viewProps.hasOwnProperty('pattern') ? ' pattern="' + fieldProps.viewProps.pattern + '"' : '',
          maxlengthProp: fieldProps.viewProps.hasOwnProperty('maxlength') ? ' md-maxlength="' + fieldProps.viewProps.maxlength + '"' : '',
          minlengthProp: fieldProps.viewProps.hasOwnProperty('minlength') ? ' minlength="' + fieldProps.viewProps.minlength + '"' : '',
          minProp: fieldProps.viewProps.hasOwnProperty('min') ? ' min="' + fieldProps.viewProps.min + '"' : '',
          maxProp: fieldProps.viewProps.hasOwnProperty('max') ? ' max="' + fieldProps.viewProps.max + '"' : '',
          requiredProp: fieldProps.viewProps.hasOwnProperty('required') && fieldProps.viewProps.required == true ? ' required' : ''
        },
        messages: {
          patternMessage: fieldProps.viewProps.hasOwnProperty('patternMessage') ? '\n          <p ng-message="pattern" translate>' + fieldProps.viewProps.patternMessage + '</p>' : '',
          maxlengthMessage: fieldProps.viewProps.hasOwnProperty('maxlengthMessage') ? '\n          <p ng-message="maxlength" translate>' + fieldProps.viewProps.maxlengthMessage + '</p>' : '',
          minlengthMessage: fieldProps.viewProps.hasOwnProperty('minlengthMessage') ? '\n          <p ng-message="minlength" translate>' + fieldProps.viewProps.minlengthMessage + '</p>' : '',
          minMessage: fieldProps.viewProps.hasOwnProperty('minMessage') ? '\n          <p ng-message="min" translate>' + fieldProps.viewProps.minMessage + '</p>' : '',
          maxMessage: fieldProps.viewProps.hasOwnProperty('maxMessage') ? '\n          <p ng-message="max" translate>' + fieldProps.viewProps.maxMessage + '</p>' : '',
          requiredMessage: fieldProps.viewProps.hasOwnProperty('requiredMessage') ? '\n          <p ng-message="required" translate>' + fieldProps.viewProps.requiredMessage + '</p>' : ''
        }
      };
    }
  },
  isCheckBoxMultiple: function (fieldAttrs) {
    return fieldAttrs != null &&
      fieldAttrs.hasOwnProperty('viewProps') &&
      fieldAttrs.viewProps.fieldType == 'checkbox' &&
      fieldAttrs.viewProps.checkboxType == 'multiple';
  }
});

module.exports = ModuleGenerator;
