var grva = seed;
var grvb = seed * seed + 1;

function seededNoiseA(Q, R) {
  var AX = Q || 0;
  var BX = R || 1;

  var a = grva;
  var b = grva % 391939;
  var c = grva % 999331;
  var d = grva % 939391;

  a >>>= 0;
  b >>>= 0;
  c >>>= 0;
  d >>>= 0;
  var t = (a + b) | 0;
  a = b ^ b >>> 9;
  b = c + (c << 3) | 0;
  c = (c << 21 | c >>> 11);
  d = d + 1 | 0;
  t = t + d | 0;
  c = c + t | 0;

  grva += b * a - c;

  if (!Number.isSafeInteger(grva)) grva = seed - b;
  return ((t >>> 0) / 4294967296) * (BX - AX) + AX;
}

function seededNoiseB(Q, R) {
  var AX = Q || 0;
  var BX = R || 1;

  var a = grvb;
  var b = grvb % 391939;
  var c = grvb % 999331;
  var d = grvb % 939391;

  a >>>= 0;
  b >>>= 0;
  c >>>= 0;
  d >>>= 0;
  var t = (a + b) | 0;
  a = b ^ b >>> 9;
  b = c + (c << 3) | 0;
  c = (c << 21 | c >>> 11);
  d = d + 1 | 0;
  t = t + d | 0;
  c = c + t | 0;

  grvb += b * a - c;

  if (!Number.isSafeInteger(grvb)) grvb = seed - b;
  return ((t >>> 0) / 4294967296) * (BX - AX) + AX;
}

function testDistribution(f, n) {
  var distributionArray = new Array(10).fill(0);
  for (var i = 0; i < n; i++) {
    distributionArray[Math.floor(f() * 10)]++;
  }
  return distributionArray;
}