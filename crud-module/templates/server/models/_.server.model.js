'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * <%= humanizedSingularName %> Schema
 */
var <%= classifiedSingularName %>Schema = new Schema({<% if (!fieldsFileName) { %>
  name: {
    type: String,
    default: '',
    required: 'Please fill <%= humanizedSingularName %> name',
    trim: true
  },<% } else { %><%- modelFields %><% } %>
  created: {
    type: Date,
    default: Date.now
  },
  modified: [{
    _id: false,
    date: {
      type: Date
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    action: {
      type: String
    }
  }]<% if (logicalExclusion) { %>,
  active: {
    type: Boolean,
    default: true
  }<% } %>,
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('<%= classifiedSingularName %>', <%= classifiedSingularName %>Schema);
