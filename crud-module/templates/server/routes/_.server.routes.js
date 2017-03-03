'use strict';

/**
 * Module dependencies
 */
var <%= camelizedPluralName %>Policy = require('../policies/<%= slugifiedPluralName %>.server.policy'),
  <%= camelizedPluralName %> = require('../controllers/<%= slugifiedPluralName %>.server.controller');

module.exports = function(app) {
  // <%= humanizedPluralName %> Routes
  app.route('/api/<%= slugifiedPluralName %>').all(<%= camelizedPluralName %>Policy.isAllowed)
    .get(<%= camelizedPluralName %>.list)
    .delete(<%= camelizedPluralName %>.<% if (logicalExclusion) { %>changeState<% } else { %>delete<% } %>)
    .post(<%= camelizedPluralName %>.filter);

  app.route('/api/<%= slugifiedPluralName %>/enum/:field').all(<%= camelizedPluralName %>Policy.isAllowed)
    .get(<%= camelizedPluralName %>.getEnumValue);<% if (logicalExclusion) { %>

  app.route('/api/<%= slugifiedPluralName %>/:active').all(<%= camelizedPluralName %>Policy.isAllowed)
    .get(<%= camelizedPluralName %>.list);<% } %>

  app.route('/api/<%= slugifiedSingularName %>/:<%= camelizedSingularName %>Id').all(<%= camelizedPluralName %>Policy.isAllowed)
    .get(<%= camelizedPluralName %>.read)
    .put(<%= camelizedPluralName %>.update)
    .delete(<%= camelizedPluralName %>.<% if (logicalExclusion) { %>changeState<% } else { %>delete<% } %>);

  app.route('/api/<%= slugifiedSingularName %>').all(<%= camelizedPluralName %>Policy.isAllowed)
    .post(<%= camelizedPluralName %>.create);

  // Finish by binding the <%= humanizedSingularName %> middleware
  app.param('<%= camelizedSingularName %>Id', <%= camelizedPluralName %>.<%= camelizedSingularName %>ByID);
  app.param('field', <%= camelizedPluralName %>.getEnumValue);
};
