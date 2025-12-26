// solution 1: formula
var sum_to_n_a = function(n) {
    if (n <= 0) return 'Error: n must be a positive number';
    return n * (n + 1) / 2;
};
// solution 2: loop
var sum_to_n_b = function(n) {
    if (n <= 0) return 'Error: n must be a positive number';
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};
// solution 3: recursion
var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return n + sum_to_n_c(n - 1);
};