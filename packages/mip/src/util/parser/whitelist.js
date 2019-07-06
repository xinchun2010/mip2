/**
 * @file whitelist.js
 * @author clark-t (clarktanglei@163.com)
 * @description
 *  sync from AMP-bind:
 *  https://github.com/ampproject/amphtml/blob/master/extensions/amp-bind/0.1/bind-expression.js
 */

 import dom from '../dom/dom'
 import {globalAction} from '../event-action/globalAction'

export function HTMLElementAction ({object, property, options, args}) {
  let element = document.getElementById(object)

  if (!element) {
    // @TODO should throw an error
    return
  }

  let action = {
    handler: property,
    event: options.event,
    arg: args.map(arg => JSON.stringify(arg)).join(','),
    target: element
  }

  if (dom.isMIPElement(object)) {
    return object.executeEventAction(action)
  }

  if (globalAction[property]) {
    return globalAction[property](action)
  }
}

export function MIPAction ({options, property, args}) {
  return options.MIP({
    handler: property,
    args: args,
    event: options.event
  })
}

function instanceSort (...args) {
  return this.slice().sort(...args)
}

function instanceSplice (...args) {
  return this.slice().splice(...args)
}

export const PROTOTYPE = {
  '[object Array]': {
    concat: Array.prototype.concat,
    filter: Array.prototype.filter,
    indexOf: Array.prototype.indexOf,
    join: Array.prototype.join,
    lastIndexOf: Array.prototype.lastIndexOf,
    map: Array.prototype.map,
    reduce: Array.prototype.reduce,
    slice: Array.prototype.slice,
    some: Array.prototype.some,
    // sort: Array.prototype.sort,
    // splice: Array.prototype.splice,
    sort: instanceSort,
    splice: instanceSplice,
    includes: Array.prototype.includes
  },
  '[object Number]': {
    toExponential: Number.prototype.toExponential,
    toFixed: Number.prototype.toFixed,
    toPrecision: Number.prototype.toPrecision,
    toString: Number.prototype.toString
  },
  '[object String]': {
    charAt: String.prototype.charAt,
    charCodeAt: String.prototype.charCodeAt,
    concat: String.prototype.concat,
    indexOf: String.prototype.indexOf,
    lastIndexOf: String.prototype.lastIndexOf,
    slice: String.prototype.slice,
    split: String.prototype.split,
    substr: String.prototype.substr,
    substring: String.prototype.substring,
    toLowerCase: String.prototype.toLowerCase,
    toUpperCase: String.prototype.toUpperCase
  }
}

export const CUSTOM_FUNCTIONS = {
  encodeURI: encodeURI,
  encodeURIComponent: encodeURIComponent,

  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  sqrt: Math.sqrt,
  log: Math.log,
  max: Math.max,
  min: Math.min,
  random: Math.random,
  round: Math.round,
  sign: Math.sign,

  keys: Object.keys,
  values: Object.values,

  // 兼容以前的 MIP event 逻辑
  decodeURI: decodeURI,
  decodeURIComponent: decodeURIComponent,
  isNaN: isNaN,
  isFinite: isFinite,
  parseFloat: parseFloat,
  parseInt: parseInt,

  Number: Number,
  Date: Date,
  Boolean: Boolean,
  String: String
}

export const CUSTOM_OBJECTS = {
  event ({options, property}) {
    if (property) {
      return options.event[property]
    }

    return options.event
  },

  DOM ({options, property}) {
    let target = options.target
    if (property === 'dataset') {
      let dataset = {}
      for (let key of Object.keys(target.dataset)) {
        dataset[key] = target.dataset[key]
      }
      return dataset
    }

    if (typeof target[property] !== 'object') {
      return target[property]
    }

    if (target[property] == null) {
      return target[property]
    }
  },

  m ({options, property}) {
    let data = options.data
    return data[property]
  },

  Math ({property}) {
    return Math[property]
  },

  Number ({property}) {
    return Number[property]
  },

  Date ({property}) {
    return Date[property]
  },

  Array ({property}) {
    return Array[property]
  },

  Object ({property}) {
    return Object[property]
  },

  String ({property}) {
    return String[property]
  }
}

export function getValidObject (id) {
  return CUSTOM_OBJECTS[id] || CUSTOM_OBJECTS.m
}

export function getValidPrototypeFunction (object, property) {
  let instance = Object.prototype.toString.call(object)
  let fn = PROTOTYPE[instance] && PROTOTYPE[instance][property]
  if (!fn) {
    throw Error(`不支持 ${instance}.${property} 方法`)
  }
  return fn.bind(object)
}



