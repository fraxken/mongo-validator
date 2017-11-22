'use strict';

/**
 * CONSTANT Set of all valid MongoDB Type!
 */
const MONGO_TYPE = new Set([
  'double',
  'number',
  'string',
  'object',
  'array',
  'binData',
  'objectId',
  'bool',
  'date',
  'null',
  'regex',
  'javascript',
  'javascriptWithScope',
  'int',
  'timestamp',
  'long',
  'decimal',
  'minKey',
  'maxKey'
]);

/**
 * MONGO ATTRIBUTES
 */
const MONGO_ATTRIBUTES = new Set([
  'size',
  'capped',
  'max',
  'validationLevel',
  'validationAction',
  'strict',
  'autoIndexId',
  'raw'
]);

/**
 * @function MongoJSONToValidator
 * @param {Object} payload 
 * @returns {Object}
 */
function MongoJSONToValidator(payload) {
  const schema = {
    validator: { $and: [] }
  };

  // Apply generics attributes...
  MONGO_ATTRIBUTES.forEach((attributeStr) => {
    const innerKey = `__${attributeStr}`;
    if (payload.hasOwnProperty(innerKey)) {
      schema[attributeStr] = payload[innerKey];
      delete payload[innerKey];
    }
  });

  function _parsePayload(payload, rootName) {
    Object.keys(payload).forEach((k) => {
      let v = payload[k];
      if ('string' === typeof(rootName)) {
        k = `${rootName}.${k}`;
      }
      if ('string' === typeof(v)) {
        v = v.toLowerCase();
        let rule  = { $type: v };
        if (v.charAt(0) === '!') {
          rule.$type = v.substring(1);
          rule.$exists = true;
        }
        if (!MONGO_TYPE.has(rule.$type)) {
          throw new Error(`Unknow MongoDB Type ${v}`);
        }
        schema.validator.$and.push({ [k]: rule});
      } 
      else if (v instanceof RegExp) {
        schema.validator.$and.push({ [k]: { $regex: v}});
      } 
      else if (v instanceof Array) {
        schema.validator.$and.push({ [k]: { $in: v}});
      }
      else if ('object' === typeof(v)) {
        let rule = { $type: 'object' };
        if (v.hasOwnProperty('__exists')) {
          rule.$exists = true;
          delete v.__exist;
        }
        schema.validator.$and.push({ [k]: rule});
        _parsePayload(v, k);
      } 
    });
  }
  
  _parsePayload(payload);
  return schema;
}

// Export class
module.exports = MongoJSONToValidator;
