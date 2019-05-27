module.exports = function (stripe) {
	return {
		// Create new subscription.
		createSubscription: function (customerId, planId, cardId) {
			return new Promise(function (resolve, reject) {
				stripe.subscriptions.create({
					customer: customerId,
					items: [
						{ plan: planId }
					],
					default_source: cardId
				}, function (err, subscription) {
					if (err != null) {
						return reject(err);
					}
					resolve(subscription);
				});
			});
		},

		cancelSubscription: function (subscription_id) {
			return new Promise(function (resolve, reject) {
				stripe.subscriptions.del(subscription_id, function (err, confirmation) {
					if (err != null)  {
						return reject(err);
					}
					stripe.plans.del(confirmation.plan.id, function (err, confirmation) {
						if (err != null) {
							return reject(err);
						}
						resolve(confirmation);
					});

				})
			});
		},

		subscriptions: async function(option) {
			const promise = new Promise((resolved, rejected) => {
				stripe.subscriptions.list(
					option,
					function(err, subscriptions) {
						if(err != null) {
							return rejected();
						}
						resolved(subscriptions);
				});
			});

			return await promise.then((subs => {return subs;})).catch(_=> {return false;});
		},

		getAllSubscriptions: async function () {
			let option = {
				limit: 100
			}
			let suball = [];
			let idx = 0;
			while(true) {
				idx++;
				const sub = await this.subscriptions(option);
				if(sub == false)
					break;

				if(sub.data.length == 0) {
					break;
				}
				option.starting_after = sub.data[sub.data.length - 1].id;
				suball = suball.concat(sub.data);

				if(sub.has_more == false)
					break;
			}
			return suball;
		}

		
	}
}
