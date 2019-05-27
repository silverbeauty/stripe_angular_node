module.exports = function(stripe) {
    return {
        // Create new plan.
        createPlan: function(amount, interval, product) {
            return new Promise(function(resolve, reject) {
                stripe.plans.create({
                    currency: 'usd',
                    amount: amount,
                    interval: interval,
                    product: product
                }, function(err, plan) {
                    if (err) reject(err);
                    resolve(plan);
                });
            });
        },

        // Get a plan by product and interval. if plan dont exist, return false.
        getPlan: function(productId, interval) {
            return new Promise(function(resolve, reject) {
                stripe.plans.list(
                    { product: productId, interval: interval },
                    function(err, plans) {
                        if (err) {
                            reject(err);
                        } else if (plans.data.length > 0) {
                            resolve(plans.data[0]);
                        } else {
                            resolve(false);
                        }
                    }
                );
            });
        }
    }
}
