exports.default = function(panels) {
  const ids = panels[0].tabIds.concat(panels[1].tabIds);
  return Math.max.apply(null, ids) + 1;
};
