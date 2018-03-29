const getObjectNestedPaths = (obj) => {
  let objCopy = Object.assign({}, obj);
  let paths = [];
  Object.keys(obj).forEach(key => {
    let nestedPath = [];
    nestedPath.push(dive(obj[key]));
    paths.push(nestedPath);
  });
  return paths;
}

const getPropByString = (obj, propString) => {
  if (!propString)
      return obj;

  var prop, props = propString.split('.');

  for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
      prop = props[i];

      var candidate = obj[prop];
      if (candidate !== undefined) {
          obj = candidate;
      } else {
          break;
      }
  }
  return obj[props[i]];
}

const dive = (obj) => {
  Object.keys(obj).forEach(key => {
    if (typeof dive(obj[key]) !== 'object') {
      return dive(obj[key]);
    }
  });
}

const getDepth = (obj) => {
  let level = 1;
  let key;
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    if (typeof (obj[key]) === 'object') {
      let depth = getDepth(obj[key]) + 1;
      level = Math.max(depth, level);
    }
  }
  return level;
}

module.exports = { getObjectNestedPaths, getPropByString };

// payload = {
//   data: {
//     current: {
//       temp: 0,
//       humidity: 0
//     },
//     delta: {
//       temp: 0,
//       humidity: 0
//     }
//   }
// }

// getObjectNestedPaths(data);
// should return:
// [[data, current, temp], [data, current, humidity], [data, delta, temp], [data, delta, humidity]]
