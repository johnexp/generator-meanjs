'use strict';

var inflections = require('underscore.inflections'), s = require('underscore.string');

var htmlGenerator = module.exports;

htmlGenerator.generate = function (globalGenerator) {

  function getFields() {
    var fields = '';
    var countPairs = 0;
    var tagWasClosed = true;
    for (var field in globalGenerator.fieldsJson) {
      var fieldAttrs = globalGenerator.fieldsJson[field];
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
    globalGenerator.formFields = fields;
  }

  return getFields();

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
        return getRadioButton(fieldProps);
      default:
        return '';
    }
  }

  function getInput(fieldProps) {
    var inputProps = getInputProps(fieldProps);
    var messages = Object.keys(inputProps.messages).length > 0 && inputProps.messages.constructor === Object ?
    '\n        <div ng-messages="vm.form.' + globalGenerator.camelizedSingularName + 'Form.' + fieldProps.viewProps.name + '.$error">' +
    (inputProps.messages.hasOwnProperty('patternMessage') ? inputProps.messages.patternMessage : '') +
    (inputProps.messages.hasOwnProperty('maxlengthMessage') ? inputProps.messages.maxlengthMessage : '') +
    (inputProps.messages.hasOwnProperty('minlengthMessage') ? inputProps.messages.minlengthMessage : '') +
    (inputProps.messages.hasOwnProperty('minMessage') ? inputProps.messages.minMessage : '') +
    (inputProps.messages.hasOwnProperty('maxMessage') ? inputProps.messages.maxMessage : '') +
    (inputProps.messages.hasOwnProperty('requiredMessage') ? inputProps.messages.requiredMessage : '') +
    '\n        </div>' : '';

    return '\n      <md-input-container flex>' +
      '\n        <label for="' + fieldProps.viewProps.name + '" translate>' + fieldProps.viewProps.displayName + '</label>' + getIconTag(fieldProps.viewProps, true) +
      '\n        <input name="' + fieldProps.viewProps.name + '" type="' + fieldProps.viewProps.fieldType +
      '" ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '" id="' + fieldProps.viewProps.name + '"' +
      inputProps.props.patternProp +
      inputProps.props.maxlengthProp +
      inputProps.props.minlengthProp +
      inputProps.props.minProp +
      inputProps.props.maxProp +
      inputProps.props.requiredProp + '>' + messages +
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
      checkboxes += '\n        <md-checkbox name="' + selectedName + '[]"' + ' value="{{' + fieldProps.viewProps.name + '}}"' +
        ' ng-checked="vm.' + selectedName + '.indexOf(' + fieldProps.viewProps.name + ') > -1"' + ' ng-click="vm.toggle' +
        toggleSelectedName + '(' + fieldProps.viewProps.name + ')"' + disabled + '>' +
        '\n          <span>' + humanizedName + '</span>' +
        '\n        </md-checkbox>';
      checkboxes += '\n      </div>';
    } else {
      checkboxes += '\n      <md-checkbox ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '"' + disabled + '>' +
        '\n        <span>' + fieldProps.viewProps.displayName + '</span>' +
        '\n      </md-checkbox>';
    }
    return checkboxes;
  }

  function getSwitch(fieldProps) {
    var disabled = fieldProps.viewProps.hasOwnProperty('disabled') ? ' ng-disabled="' + fieldProps.viewProps.disabled + '"' : '';
    var switchee = '\n      <md-switch' + disabled + ' aria-label="' + fieldProps.viewProps.displayName + '" ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '">' +
      '\n        ' + fieldProps.viewProps.displayName +
      '\n      </md-switch>';
    return switchee;
  }

  function getSelectOption(fieldProps) {
    var inputProps = getInputProps(fieldProps);
    var hasSearch = fieldProps.viewProps.hasOwnProperty('search') && fieldProps.viewProps.search == true;

    var searchTag = hasSearch ? '\n          <md-select-header class="select-search-header">' +
    '\n            <input ng-model="vm.selectOptSearchTerm" type="search" placeholder="{{ \'Search for a ' + fieldProps.viewProps.displayName + '...\' | translate }}" class="select-search-searchbox md-text">' +
    '\n          </md-select-header>' : '';

    var emptyOption = !fieldProps.viewProps.hasOwnProperty('required') || fieldProps.viewProps.required == false ?
      '\n          <md-option><em translate>None</em></md-option>' : '';

    var messages = Object.keys(inputProps.messages).length > 0 && inputProps.messages.constructor === Object ?
    '\n        <div ng-messages="vm.form.' + globalGenerator.camelizedSingularName + 'Form.' + fieldProps.viewProps.name + '.$error">' +
    (inputProps.messages.hasOwnProperty('requiredMessage') ? inputProps.messages.requiredMessage : '') +
    '\n        </div>' : '';

    return '\n      <md-input-container flex>' +
      '\n        <label>' + fieldProps.viewProps.displayName + '</label>' + getIconTag(fieldProps.viewProps, true) +
      '\n        <md-select ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '"' +
      (hasSearch ? ' md-on-close="vm.clearSelectOptSearchTerm()" data-md-container-class="select-search"' : '') +
      inputProps.props.multipleProp + inputProps.props.requiredProp + '>' +
      searchTag +
      emptyOption +
      getOptGroup(fieldProps) +
      '\n        </md-select>' + messages +
      '\n      </md-input-container>';
  }

  function getOptGroup(fieldProps) {
    var pluralizedName = inflections.pluralize(fieldProps.viewProps.name);
    var pluralizedDisplayNameName = inflections.pluralize(fieldProps.viewProps.displayName);

    if (fieldProps.viewProps.hasOwnProperty('required') && fieldProps.viewProps.required == true) {
      return '\n          <md-optgroup label="' + pluralizedDisplayNameName + '">' +
        '\n            <md-option ng-value="' + fieldProps.viewProps.name + '._id" ' +
        'ng-selected="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '.indexOf(' + fieldProps.viewProps.name + '._id) > -1" ' +
        'ng-repeat="' + fieldProps.viewProps.name + ' in vm.' + pluralizedName + ' | filter: vm.selectOptSearchTerm">' +
        '\n              {{' + fieldProps.viewProps.name + '.' + fieldProps.viewProps.objectIdDisplayName + '}}' +
        '\n            </md-option>' +
        '\n          </md-optgroup>';
    } else {
      // TODO: Validate display name and id at value and indexOf to verify if is selected case enum
      return '\n          <md-option ng-value="' + fieldProps.viewProps.name + '._id" ' +
        'ng-selected="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '.indexOf(' + fieldProps.viewProps.name + '._id) > -1" ' +
        'ng-repeat="' + fieldProps.viewProps.name + ' in vm.' + pluralizedName + ' | filter: vm.selectOptSearchTerm">' +
        '\n            {{' + fieldProps.viewProps.name + '.' + fieldProps.viewProps.objectIdDisplayName + '}}' +
        '\n          </md-option>';
    }
  }

  function getRadioButton(fieldProps) {
    var disabled = fieldProps.viewProps.hasOwnProperty('disabled') ? ' ng-disabled="' + fieldProps.viewProps.disabled + '"' : '';
    var pluralizedName = inflections.pluralize(fieldProps.viewProps.name);
    var radioButtons = '\n      <div layout="column">' +
      '\n        <p>' + fieldProps.viewProps.displayName + '</p>' +
      '\n        <md-radio-group' + disabled + '>' +
      '\n          <md-radio-button ng-repeat="' + fieldProps.viewProps.name + ' in vm.' + pluralizedName + '" ng-value="' + fieldProps.viewProps.name + '">' +
      '\n            {{' + fieldProps.viewProps.name + '}}' +
      '\n          </md-radio-button>' +
      '\n        </md-radio-group>' +
      '\n      </div>';
    return radioButtons;
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
      messages.maxlengthMessage = '\n          <p ng-message="maxlength" translate>' + fieldProps.viewProps.maxlengthMessage + '</p>';
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
    return fieldAttrs != null && fieldAttrs.hasOwnProperty('viewProps') && ((fieldAttrs.viewProps.fieldType == 'checkbox' && fieldAttrs.viewProps.checkboxType == 'multiple') || fieldAttrs.viewProps.fieldType == 'switch');
  }

};
