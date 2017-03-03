'use strict';

var inflections = require('underscore.inflections'), s = require('underscore.string'), _ = require('lodash');

var htmlGenerator = module.exports;

htmlGenerator.generate = function (globalGenerator) {

  function getFields() {
    var fields = '';
    var countPairs = 0;
    var tagWasClosed = true;
    for (var field in globalGenerator.fieldsJson) {
      var fieldAttrs = globalGenerator.fieldsJson[field];
      if (fieldAttrs && fieldAttrs.hasOwnProperty('viewProps')) {
        var singleFieldLine = isSingleFieldLine(fieldAttrs);
        if (countPairs == 0 || singleFieldLine) {
          if (tagWasClosed == false) {
            fields += '\n    </div>';
          }
          fields += getInputRowOppening(singleFieldLine);
          tagWasClosed = false;
        }
        fields += getHtmlField(fieldAttrs);
        countPairs++;
        if (countPairs == 2 || singleFieldLine) {
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
        return getInputText(fieldProps);
      case 'textarea':
        return getTextArea(fieldProps);
      case 'checkbox':
        return getCheckbox(fieldProps);
      case 'select':
        return getSelectItem(fieldProps);
      case 'switch':
        return getSwitch(fieldProps);
      case 'radiobutton':
        return getRadioButton(fieldProps);
      case 'date':
        return getDateField(fieldProps);
      case 'slider':
        return getSliderField(fieldProps);
      case 'chips':
        return getChipsField(fieldProps);
      default:
        return '';
    }
  }

  function getInputText(fieldProps) {
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

  function getTextArea(fieldProps) {
    var inputProps = getInputProps(fieldProps);
    var messages = Object.keys(inputProps.messages).length > 0 && inputProps.messages.constructor === Object ?
    '\n        <div ng-messages="vm.form.' + globalGenerator.camelizedSingularName + 'Form.' + fieldProps.viewProps.name + '.$error">' +
    (inputProps.messages.hasOwnProperty('maxlengthMessage') ? inputProps.messages.maxlengthMessage : '') +
    (inputProps.messages.hasOwnProperty('minlengthMessage') ? inputProps.messages.minlengthMessage : '') +
    (inputProps.messages.hasOwnProperty('requiredMessage') ? inputProps.messages.requiredMessage : '') +
    '\n        </div>' : '';
    var rows = fieldProps.viewProps.hasOwnProperty('rows') ? ' rows="' + fieldProps.viewProps.rows + '"' : '';

    return '\n      <md-input-container flex>' +
      '\n        <label for="' + fieldProps.viewProps.name + '" translate>' + fieldProps.viewProps.displayName + '</label>' + getIconTag(fieldProps.viewProps, true) +
      '\n        <textarea name="' + fieldProps.viewProps.name + '" type="' + fieldProps.viewProps.fieldType + rows +
      '" ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '" id="' + fieldProps.viewProps.name + '"' +
      inputProps.props.maxlengthProp +
      inputProps.props.minlengthProp +
      inputProps.props.requiredProp + '>' + messages + '</textarea>' +
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
      var singularizedName = s(inflections.singularize(fieldProps.viewProps.name)).camelize().value();
      var humanizedName = s(inflections.pluralize(fieldProps.viewProps.name)).humanize().value();

      checkboxes += '\n      <div flex="' + fieldProps.viewProps.colSize + '" ng-repeat="' + singularizedName + ' in vm.' + pluralizedName + '">';
      checkboxes += '\n        <md-checkbox name="' + selectedName + '[]"' + ' value="{{' + singularizedName + '}}"' +
        ' ng-checked="vm.' + selectedName + '.indexOf(' + singularizedName + ') > -1"' + ' ng-click="vm.toggle' +
        toggleSelectedName + '(' + singularizedName + ')"' + disabled + '>' +
        '\n          <span>' + humanizedName + '</span>' +
        '\n        </md-checkbox>';
      checkboxes += '\n      </div>';
    } else {
      checkboxes += '\n      <md-checkbox name="' + fieldProps.viewProps.name + '" ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '"' + disabled + '>' +
        '\n        <span>' + fieldProps.viewProps.displayName + '</span>' +
        '\n      </md-checkbox>';
    }
    return checkboxes;
  }

  function getSwitch(fieldProps) {
    var disabled = fieldProps.viewProps.hasOwnProperty('disabled') ? ' ng-disabled="' + fieldProps.viewProps.disabled + '"' : '';
    var switchee = '\n      <md-switch' + disabled + ' aria-label="' + fieldProps.viewProps.displayName + '" ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '" name="' + fieldProps.viewProps.name + '">' +
      '\n        ' + fieldProps.viewProps.displayName +
      '\n      </md-switch>';
    return switchee;
  }

  function getSelectItem(fieldProps) {
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
      '\n        <md-select name="' + fieldProps.viewProps.name + '" ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '"' +
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
    var singularizedName = inflections.singularize(fieldProps.viewProps.name);
    var pluralizedDisplayNameName = inflections.pluralize(fieldProps.viewProps.displayName);
    var selected = '', value = '', displayValue = '';

    if (isEnum(fieldProps)) {
      if (fieldProps.viewProps.hasOwnProperty('multiple') && fieldProps.viewProps.multiple == true) {
        selected = ' ng-selected="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '.indexOf(' + singularizedName + ') > -1" ';
      }
      value = ' ng-value="' + singularizedName + '" ';
      displayValue = '            {{' + singularizedName + '}}';
    } else {
      selected = ' ng-selected="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '.indexOf(' + singularizedName + '._id) > -1" ';
      value = ' ng-value="' + singularizedName + '._id" ';
      displayValue = '            {{' + singularizedName + '.' + fieldProps.viewProps.objectIdDisplayName + '}}';
    }

    if (fieldProps.viewProps.hasOwnProperty('required') && fieldProps.viewProps.required == true) {
      return '\n          <md-optgroup label="' + pluralizedDisplayNameName + '">' +
        '\n            <md-option' + value + selected + 'ng-repeat="' + singularizedName + ' in vm.' + pluralizedName + ' | filter: vm.selectOptSearchTerm">' +
        '\n  ' + displayValue +
        '\n            </md-option>' +
        '\n          </md-optgroup>';
    } else {
      return '\n          <md-option' + value + selected + 'ng-repeat="' + singularizedName + ' in vm.' + pluralizedName + ' | filter: vm.selectOptSearchTerm">' +
        '\n' + displayValue +
        '\n          </md-option>';
    }
  }

  function getRadioButton(fieldProps) {
    var disabled = fieldProps.viewProps.hasOwnProperty('disabled') ? ' ng-disabled="' + fieldProps.viewProps.disabled + '"' : '';
    var pluralizedName = inflections.pluralize(fieldProps.viewProps.name);
    var singularizedName = inflections.singularize(fieldProps.viewProps.name);
    var radioButtons = '\n      <div layout="column">' +
      '\n        <p>' + fieldProps.viewProps.displayName + '</p>' +
      '\n        <md-radio-group ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '" name="' + fieldProps.viewProps.name + '"' + disabled + '>' +
      '\n          <md-radio-button ng-repeat="' + singularizedName + ' in vm.' + pluralizedName + '" ng-value="' + singularizedName + '">' +
      '\n            {{' + singularizedName + '}}' +
      '\n          </md-radio-button>' +
      '\n        </md-radio-group>' +
      '\n      </div>';
    return radioButtons;
  }

  function getDateField(fieldProps) {
    var inputProps = getInputProps(fieldProps);
    var datepickerOptions = fieldProps.viewProps.hasOwnProperty('datepickerOptions') ? ' ' + fieldProps.viewProps.datepickerOptions : '';
    var messages = Object.keys(inputProps.messages).length > 0 && inputProps.messages.constructor === Object ?
    '\n        <div ng-messages="vm.form.' + globalGenerator.camelizedSingularName + 'Form.' + fieldProps.viewProps.name + '.$error">' +
    (inputProps.messages.hasOwnProperty('validMessage') ? inputProps.messages.validMessage : '') +
    (inputProps.messages.hasOwnProperty('mindateMessage') ? inputProps.messages.mindateMessage : '') +
    (inputProps.messages.hasOwnProperty('maxdateMessage') ? inputProps.messages.maxdateMessage : '') +
    (inputProps.messages.hasOwnProperty('requiredMessage') ? inputProps.messages.requiredMessage : '') +
    '\n        </div>' : '';

    return '\n      <md-input-container flex>' +
      '\n        <label>Enter date</label>' +
      '\n        <md-datepicker ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '" name="' + fieldProps.viewProps.name + '"' + datepickerOptions +
      inputProps.props.mindateProp +
      inputProps.props.maxdateProp +
      inputProps.props.requiredProp + '></md-datepicker>' + messages +
      '\n      </md-input-container>';
  }

  function getSliderField(fieldProps) {
    var inputProps = getInputProps(fieldProps);
    var sliderOptions = fieldProps.viewProps.hasOwnProperty('sliderOptions') ? ' ' + fieldProps.viewProps.sliderOptions : '';

    return '\n      <label for="' + fieldProps.viewProps.name + '" translate>' + fieldProps.viewProps.displayName + '</label>' +
      '\n      <md-slider-container>' +
      '\n        <md-slider flex ' +
      'ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '" ' +
      'name="' + fieldProps.viewProps.name + '" ' +
      'aria-label="' + fieldProps.viewProps.displayName + '" ' + sliderOptions +
      inputProps.props.minProp +
      inputProps.props.maxProp + '>' +
      '</md-slider>' +
      '\n        <md-input-container>' +
      '\n          <input flex type="number" ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '" ' +
      'name="' + fieldProps.viewProps.name + '" ' +
      'id="' + fieldProps.viewProps.name + '" ' +
      'aria-label="' + fieldProps.viewProps.displayName + '" ' +
      'aria-controls="' + fieldProps.viewProps.name + '"' +
      inputProps.props.minProp +
      inputProps.props.maxProp +
      inputProps.props.requiredProp + '">' +
      '\n        </md-input-container>' +
      '\n      </md-slider-container>';
  }

  function getChipsField(fieldProps) {
    var inputProps = getInputProps(fieldProps);
    return '\n      <md-chips flex ng-model="vm.' + globalGenerator.camelizedSingularName + '.' + fieldProps.viewProps.name + '" ' +
      'name="' + fieldProps.viewProps.name + '" ' +
      'md-enable-chip-edit="true" ' +
      'placeholder="' + fieldProps.viewProps.displayName + '" ' +
      'md-removable="true"' +
      inputProps.props.requiredProp + '></md-chips>';
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

  function getInputRowOppening(isSingleFieldLine) {
    if (isSingleFieldLine) {
      return '\n    <div class="md-block">';
    }
    return '\n    <div layout="column" layout-gt-sm="row" layout-wrap>';
  }

  function getInputProps(fieldProps) {
    var messages = {};

    if (fieldProps.viewProps.hasOwnProperty('patternMessage'))
      messages.patternMessage = '\n          <p ng-message="pattern" translate>' + fieldProps.viewProps.patternMessage + '</p>';
    if (fieldProps.viewProps.hasOwnProperty('maxlengthMessage'))
      messages.maxlengthMessage = '\n          <p ng-message="maxlength" translate>' + fieldProps.viewProps.maxlengthMessage + '</p>';
    if (fieldProps.viewProps.hasOwnProperty('minlengthMessage'))
      messages.minlengthMessage = '\n          <p ng-message="minlength" translate>' + fieldProps.viewProps.minlengthMessage + '</p>';
    if (fieldProps.viewProps.hasOwnProperty('minMessage'))
      messages.minMessage = '\n          <p ng-message="min" translate>' + fieldProps.viewProps.minMessage + '</p>';
    if (fieldProps.viewProps.hasOwnProperty('maxMessage'))
      messages.maxMessage = '\n          <p ng-message="max" translate>' + fieldProps.viewProps.maxMessage + '</p>';
    if (fieldProps.viewProps.hasOwnProperty('requiredMessage'))
      messages.requiredMessage = '\n          <p ng-message="required" translate>' + fieldProps.viewProps.requiredMessage + '</p>';
    if (fieldProps.viewProps.hasOwnProperty('mindateMessage'))
      messages.mindateMessage = '\n          <p ng-message="mindate" translate>' + fieldProps.viewProps.mindateMessage + '</p>';
    if (fieldProps.viewProps.hasOwnProperty('maxdateMessage'))
      messages.maxdateMessage = '\n          <p ng-message="maxdate" translate>' + fieldProps.viewProps.maxdateMessage + '</p>';
    if (fieldProps.viewProps.hasOwnProperty('validMessage'))
      messages.validMessage = '\n          <p ng-message="valid" translate>' + fieldProps.viewProps.validMessage + '</p>';

    return {
      props: {
        patternProp: fieldProps.viewProps.hasOwnProperty('pattern') ? ' pattern="' + fieldProps.viewProps.pattern + '"' : '',
        maxlengthProp: fieldProps.viewProps.hasOwnProperty('maxlength') ? ' md-maxlength="' + fieldProps.viewProps.maxlength + '"' : '',
        minlengthProp: fieldProps.viewProps.hasOwnProperty('minlength') ? ' minlength="' + fieldProps.viewProps.minlength + '"' : '',
        minProp: fieldProps.viewProps.hasOwnProperty('min') ? ' min="' + fieldProps.viewProps.min + '"' : '',
        maxProp: fieldProps.viewProps.hasOwnProperty('max') ? ' max="' + fieldProps.viewProps.max + '"' : '',
        requiredProp: fieldProps.viewProps.hasOwnProperty('required') && fieldProps.viewProps.required == true ? ' required' : '',
        multipleProp: fieldProps.viewProps.hasOwnProperty('multiple') && fieldProps.viewProps.multiple == true ? ' multiple' : '',
        mindateProp: fieldProps.viewProps.hasOwnProperty('mindate') ? ' md-min-date="' + fieldProps.viewProps.mindate + '"' : '',
        maxdateProp: fieldProps.viewProps.hasOwnProperty('maxdate') ? ' md-max-date="' + fieldProps.viewProps.maxdate + '"' : ''
      },
      messages: messages
    };
  }

  function isSingleFieldLine(fieldProps) {
    return fieldProps != null &&
      fieldProps.hasOwnProperty('viewProps') &&
      ((fieldProps.viewProps.fieldType == 'checkbox' &&
      fieldProps.viewProps.checkboxType == 'multiple')
      || fieldProps.viewProps.fieldType == 'switch'
      || fieldProps.viewProps.fieldType == 'chips'
      || fieldProps.viewProps.fieldType == 'slider');
  }

  function isEnum(fieldProps) {
    if (fieldProps.modelProps.hasOwnProperty('enum') || _.includes(fieldProps.modelProps.type, 'enum')) {
      return true;
    }
  }

};
