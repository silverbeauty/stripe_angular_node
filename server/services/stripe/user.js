module.exports = function (invoiceService, productService) {
	return {

		
		// Collect user informations
		collectUserInfo: function (subscriptions) {
			return new Promise(async function (resolve, reject) {
				let productMap = new Map();
				let cardMap = new Map();
				for (var i = 0; i < subscriptions.length; i++) {
					const invoices = await invoiceService.getInvoices(subscriptions[i].id, subscriptions[i].customer);
					const productId = subscriptions[i].plan.product;
					let productItem = productMap.get(productId);

					const cardId = subscriptions[i].default_source;
					let cardItem = cardMap.get(cardId);

					if(productItem == undefined || productItem == null) {
						const product = await productService.getProduct(subscriptions[i].plan.product);
						productItem = {productId: productId, charityname: product.name, ytd: 0, cardId};
						productMap.set(productId, productItem);
					} else {
						productItem = productMap.get(productId);
					}

					if(cardItem == undefined || cardItem == null) {
						cardItem = {cardId: cardId, charities: [{charityname: productItem.charityname, subscription: subscriptions[i]}]};
						cardMap.set(cardId, cardItem);
					} else {
						cardItem = cardMap.get(cardId);
						cardItem.charities.push({charityname: productItem.charityname, subscription: subscriptions[i]});
					}
					let totalAmountOfSub = 0;
					invoices.forEach(invoice => {
						//console.log('invoice', invoice);
						totalAmountOfSub += invoice.total;
					});
					
					productItem.ytd += totalAmountOfSub / 100;
					productItem.amount = subscriptions[i].plan.amount/100;
					productItem.schedule = subscriptions[i].plan.interval;
					productItem.projection = calcYearProjection(productItem);
					productItem.invoices = invoices;
					
					// console.log(`subscriptions[${i}]`, subscriptions[i]);
					// console.log('invoices', invoices);

					//getInvoicesPromises.push(invoiceService.getInvoices(subscriptions[i].id, subscriptions[i].customer));
					//getProductPromises.push(productService.getProduct(subscriptions[i].plan.product));
				}

				resolve({productMap, cardMap});
				// Promise.all(getProductPromises)
				// 	.then((products) => {
				// 		for (var i = 0; i < products.length; i++) {
				// 			let product = {
				// 				charityname: products[i].name
				// 			}
				// 			contributions.push(product);
				// 		}
				// 		Promise.all(getInvoicesPromises)
				// 			.then((invoices) => {
				// 				for (var i = 0; i < invoices.length; i++) {
				// 					let totalAmount = 0;
				// 					for (var j = 0; j < invoices[i].length; j++) {
				// 						totalAmount += invoices[i][j].total;
				// 					}
				// 					contributions[i]['ytd'] = totalAmount / 100;
				// 					contributions[i]['amount'] = invoices[i][0].amount_paid / 100;
				// 					contributions[i]['schedule'] = subscriptions[i].plan.interval;
				// 					contributions[i]['projection'] = calcYearProjection(contributions[i]);
				// 					contributions[i]['invoices'] = invoices[i];
				// 				}
				// 				resolve(contributions);
				// 			})
				// 			.catch(err => reject(err));
				// 	})
				// 	.catch(err => reject(err));
			});
		}
	}
}

// Calculate the projection amount for a year
function calcYearProjection(data) {
	let projection = data.ytd;
	const today = new Date();
	const dd = today.getDate();
	const mm = today.getMonth() + 1;
	const yyyy = today.getFullYear();
	const todayStr = mm + '/' + dd + '/' + yyyy;
	const endDate = '12/31/' + yyyy;

	const date1 = new Date(todayStr);
	const date2 = new Date(endDate);
	const timeDiff = Math.abs(date2.getTime() - date1.getTime());
	const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	const diffWeek = Math.ceil(diffDays / 7);
	const diffMonth = Math.ceil(diffDays / 30);
	const diffYear = Math.ceil(diffDays / 365);
	switch (data.schedule) {
		case "day": projection += data.amount * diffDays; break;
		case "week": projection += data.amount * diffWeek; break;
		case "month": projection += data.amount * diffMonth; break;
		case "year": projection += data.amount * diffYear; break;
	}
	return projection;
}
