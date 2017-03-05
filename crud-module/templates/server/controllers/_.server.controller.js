'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  <%= classifiedSingularName %> = mongoose.model('<%= classifiedSingularName %>'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a <%= humanizedSingularName %>
 */
exports.create = function(req, res) {
  var <%= camelizedSingularName %> = new <%= classifiedSingularName %>(req.body);
  <%= camelizedSingularName %>.user = req.user;
  <%= camelizedSingularName %>.modified.push({ 'date': Date.now(), 'user': req.user, 'action': 'C' });

  <%= camelizedSingularName %>.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(<%= camelizedSingularName %>);
    }
  });
};

/**
 * Show the current <%= humanizedSingularName %>
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var <%= camelizedSingularName %> = req.<%= camelizedSingularName %> ? req.<%= camelizedSingularName %>.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  <%= camelizedSingularName %>.isCurrentUserOwner = req.user && <%= camelizedSingularName %>.user && <%= camelizedSingularName %>.user._id.toString() === req.user._id.toString();

  res.jsonp(<%= camelizedSingularName %>);
};

/**
 * Update a <%= humanizedSingularName %>
 */
exports.update = function(req, res) {
  var <%= camelizedSingularName %> = req.<%= camelizedSingularName %>;

  <%= camelizedSingularName %> = _.extend(<%= camelizedSingularName %>, req.body);
  <%= camelizedSingularName %>.modified.push({ 'date': Date.now(), 'user': req.user, 'action': 'U' });

  <%= camelizedSingularName %>.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(<%= camelizedSingularName %>);
    }
  });
};<% if (logicalExclusion) { %>

/**
 * Change activation state of a <%= humanizedSingularName %>
 */
exports.changeState = function(req, res) {
  var <%= camelizedSingularName %> = req.<%= camelizedSingularName %>;
  <%= camelizedSingularName %>.active = !<%= camelizedSingularName %>.active;
  var state = <%= camelizedSingularName %>.active ? 'A' : 'I';
  <%= camelizedSingularName %>.modified.push({ 'date': Date.now(), 'user': req.user, 'action': state });

  <%= camelizedSingularName %>.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(<%= camelizedSingularName %>);
    }
  });
};<% } else { %>

/**
 * Delete a <%= humanizedSingularName %>
 */
exports.delete = function(req, res) {
  var <%= camelizedSingularName %> = req.<%= camelizedSingularName %>;

  <%= camelizedSingularName %>.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(<%= camelizedSingularName %>);
    }
  });
};<% } %>

/**
 * List of <%= humanizedPluralName %>
 */
exports.list = function(req, res) {<% if (logicalExclusion) { %>
  var objFilter = {};
  if (req.params.hasOwnProperty('active')) {
    objFilter.active = req.params.active;
  }
<% } %>
  <%= classifiedSingularName %>
    .find(objFilter)
    .sort('-created')
    .populate([{
      path: 'user',
      select: 'displayName'
    }<% if (populateFields) { %><% populateFields.forEach(function (value) { %><%= ', {' %>
      <%- 'path: \'' + value.path + '\'' %><% if (value.select) { %><%= ',' %>
      <%- 'select: \'' + value.select + '\'' %>
    <%- '}' %><% }})} %>])
    .exec(function(err, <%= camelizedPluralName %>) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(<%= camelizedPluralName %>);
      }
    });
};

/**
 * Filter <%= humanizedPluralName %>
 */
exports.filter = function(req, res) {
  if (req.body.hasOwnProperty('queryCount') && req.body.queryCount === true) {
    return count(req.body, res);
  }
  var filter = req.body.hasOwnProperty('filter') ? req.body.filter : {};
  var paramsLength = Object.keys(filter).length;
  var pagination = req.body.hasOwnProperty('pagination') ? req.body.pagination : { sort: '', offset: 0, limit: 10 };
  for (var i = 0; i < paramsLength; i++) {
    var key = Object.keys(filter)[i];
    if (typeof filter[key] === 'string' || filter[key] instanceof String) {
      filter[key] = new RegExp(filter[key], 'i');
    }
  }
  <%= classifiedSingularName %>
    .find(filter).sort(pagination.sort)
    .skip(pagination.offset)
    .limit(pagination.limit)
    .populate([{
      path: 'user',
      select: 'displayName'
    }<% if (populateFields) { %><% populateFields.forEach(function (value) { %><%= ', {' %>
      <%- 'path: \'' + value.path + '\'' %><% if (value.select) { %><%= ',' %>
      <%- 'select: \'' + value.select + '\'' %>
    <%- '}' %><% }})} %>])
    .exec(function(err, <%= camelizedPluralName %>) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(<%= camelizedPluralName %>);
      }
    });
};

/**
 * Count <%= humanizedPluralName %>
 */
function count(body, res) {
  var filter = body.hasOwnProperty('filter') ? body.filter : {};
  var paramsLength = Object.keys(filter).length;
  for (var i = 0; i < paramsLength; i++) {
    var key = Object.keys(filter)[i];
    if (typeof filter[key] === 'string' || filter[key] instanceof String) {
      filter[key] = new RegExp(filter[key], 'i');
    }
  }
  <%= classifiedSingularName %>.count(filter).exec(function(err, count) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp([count]);
    }
  });
}

/**
 * <%= humanizedSingularName %> middleware
 */
exports.<%= camelizedSingularName %>ByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: '<%= humanizedSingularName %> is invalid'
    });
  }

  <%= classifiedSingularName %>.findById(id)
    .populate([{
      path: 'user',
      select: 'displayName'
    }, {
      path: 'modified.user',
      select: 'displayName'
    }<% if (populateFields) { %><% populateFields.forEach(function (value) { %><%= ', {' %>
      <%- 'path: \'' + value.path + '\'' %><% if (value.select) { %><%= ',' %>
      <%- 'select: \'' + value.select + '\'' %>
    <%- '}' %><% }})} %>])
    .exec(function (err, <%= camelizedSingularName %>) {
      if (err) {
        return next(err);
      } else if (!<%= camelizedSingularName %>) {
        return res.status(404).send({
          message: 'No <%= humanizedSingularName %> with that identifier has been found'
        });
      }
      req.<%= camelizedSingularName %> = <%= camelizedSingularName %>;
      next();
    });
};

/**
 * Get available values of a enum
 */
exports.getEnumValue = function(req, res, next, field) {
  try {
    var enumValues = <%= classifiedSingularName %>.schema.path(field).enumValues;
    res.jsonp(enumValues);
  } catch (ex) {
    return res.status(400).send({
      message: 'The field "' + field + '" is not a valid enum.'
    });
  }
};
