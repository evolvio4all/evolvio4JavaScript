function approximate_tanh(x) {
  if (x < -3) {
    return -1;
  } else if (x > 3) {
    return 1;
  } else {
    var xSq = x * x;
    return x * (27 + xSq) / (27 + 9 * xSq);
  }
}