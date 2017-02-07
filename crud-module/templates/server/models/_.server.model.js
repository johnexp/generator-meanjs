'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * <%= humanizedSingularName %> Schema
 */
var <%= classifiedSingularName %>Schema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill <%= humanizedSingularName %> name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
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
  }],
  active: {
    type: Boolean,
    default: true
  }<% if (fieldsFileName) { %><%= printModelFields %><% } %>
});

mongoose.model('<%= classifiedSingularName %>', <%= classifiedSingularName %>Schema);
