function cacheKeyGenerator(oLat, oLong, dLat, dLong) {
  let precision = process.env.CACHE_PRECISION;
  let key =
    oLat.toFixed(precision) +
    "," +
    oLong.toFixed(precision) +
    "-" +
    dLat.toFixed(precision) +
    "," +
    dLong.toFixed(precision);
  return key;
}


module.exports = cacheKeyGenerator