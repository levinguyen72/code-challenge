// solution 1: formula
var sum_to_n_a = function(n) {
    return n * (n + 1) / 2;
};
// solution 2: loop
var sum_to_n_b = function(n) {
    for (let i = 1; i <= n; i++) {
    sum += i;
    }
    return sum;
};
// solution 3: recursion
var sum_to_n_c = function(n) {
    if(n === 1) {
    return 1;
    }
    return n + sum_to_n_c(n - 1);
};