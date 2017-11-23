# mongo-validator
MongoDB JSON to Validator

# Usage example

```js
const mongoValidator = require('mongo-validator');

const payload = {
    __size: 10,
    foo: '!String',
    bar: 'Number',
    customObject: {
        __exists: true,
        propTest: 'Bool'
    }
}; 
const validatorPayload = mongoValidator(payload);
console.log(validatorPayload);
```

It will log (stdout) the following result : 

```
{
  "validator": {
    "$and": [
      {
        "foo": {
          "$type": "string",
          "$exists": true
        }
      },
      {
        "bar": {
          "$type": "number"
        }
      },
      {
        "customObject": {
          "$type": "object",
          "$exists": true
        }
      },
      {
        "customObject.propTest": {
          "$type": "bool"
        }
      }
    ]
  },
  "size": 10
}
```

Use this object as a validator for MongoDB (when you create a new collection for example).

mongoValidator function can take an options Object that allow you to redefine the attributes caracter.

```js
const validatorPayload = mongoValidator(payload, {
  attributes_char: '#'
});
```