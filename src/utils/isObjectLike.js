define(function () {
  function isObjectLike(value) {
    return (value && typeof value === 'object') || false;
  }
  return isObjectLike;
});