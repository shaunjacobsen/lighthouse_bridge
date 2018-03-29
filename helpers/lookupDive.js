const lookupDive = (doc, p) => {
  let newDocument = Object.assign({}, doc._doc);
  for (var i = 0; i < p.length; i++) {
    newDocument = newDocument[p[i]];
  }
  return newDocument;
};

module.exports = { lookupDive };