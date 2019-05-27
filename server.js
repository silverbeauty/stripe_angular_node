
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const firebase = require('firebase');
const fbConfig = require('./firebase.json');
// Initialize Firebase
firebase.initializeApp(fbConfig);
let database = firebase.database();
let fbAuth = firebase.auth();
const fbDB = require('./server/services/firebase/database')(database);

// database.ref('users').orderByChild("email").equalTo('devskill2015@yandex.com').once("value").then(ddd => {
	
	
// 	ddd.forEach(function (user) {
// 		console.log('dddd', user);
// 		console.log('dddd===key', user.key);
// 		console.log('dddd===data', user.val());
// 		database.ref(`users/${user.key}`).update({test: 'tttt'});

// 	});
		
// });
//const stripe = require('stripe')('sk_test_LVx3d8fWhuQl1YCV3BnfWzP4');
const stripe = require('stripe')('sk_test_xEHDvAts6KDcJ6QEQ0kWEuIl00WBISpBby'); 

const planService = require('./server/services/stripe/plan')(stripe);
const productService = require('./server/services/stripe/product')(stripe);
const subscriptionService = require('./server/services/stripe/subscription')(stripe);
const invoiceService = require('./server/services/stripe/invoice')(stripe);
const cardService = require('./server/services/stripe/card')(stripe);
const userService = require('./server/services/stripe/user')(invoiceService, productService);
const customerService = require('./server/services/stripe/customer')(stripe, fbDB);
const dateService = require('./server/services/common/date');


const app = express();

//Set CORS middleware : Uncomment for production
// let corsOptions = {
// 	origin: 'http://localhost:4200',
// 	optionsSuccessStatus: 200
// }
// app.use(cors(corsOptions));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handlers
app.use(function (err, req, res, next) {
	if (!err) {
		next();
	}
	console.log(err.stack);
	res.status(err.status || 500);
	res.send(err);
});

// Serve only the static files form the dist directory
app.use('/', express.static(__dirname + '/dist'));

app.get('*', function (req, res) {
	res.sendFile(path.join(__dirname + '/dist/index.html'));
});

/***************************************************************************
 *                                                                         *
 *     Check if user is registered on database                             *
 *                                                                         *
 ***************************************************************************/
app.post('/check-user', function (req, res) {
	const email = req.body.email;
	fbDB.getUserByEmail(email).then(snapshot => {
		
		if (snapshot.val()) {
			res.send(snapshot.val());
		} else {
			res.send(null);
		}
	});
});

/***************************************************************************
 *                                                                         *
 *     Get user's general informations                                     *
 *                                                                         *
 ***************************************************************************/
app.post('/getUserInfo', function (req, res) {
	const userId = req.body.uid;

	fbDB.getUserById(userId).then(user => {
		let userData = user.val();

		customerService.getCustomersByEmail(userData.email).then(customers => {

			if(customers.data.length == 0) {
				return res.send({...userData, contributions: [], cards: []});
			}
			userService.collectUserInfo(customers.data[0].subscriptions.data).then(data => {
				const cards = customers.data[0].sources.data;
				cards.forEach(card => {
					const cardMapData = data.cardMap.get(card.id);
					if(cardMapData !== undefined && cardMapData !== null) {
						card.charities = cardMapData.charities;
					}
				})

				res.send({...userData, contributions: Array.from(data.productMap.values()), cards: cards});
			});
		});
	});
});

/***************************************************************************
 *                                                                         *
 *     Register new user.                                                  *
 *                                                                         *
 ***************************************************************************/
app.post('/users', function (req, res) {
	const uid = req.body.uid;
	const email = req.body.email;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;

	let data = {
		email: email,
		firstName: firstName,
		lastName: lastName,
		created: dateService.now(),
		activated: 'null',
		lastlogin: 'null',
		logincount: 0,
		recent: 'null'
	}
	fbDB.createUser(uid, data).then(result => {
		res.send({ result: 'success' });
	});
});

/***************************************************************************
 *                                                                         *
 *     Update user activities                                              *
 *                                                                         *
 ***************************************************************************/
app.post('/update-activity', function (req, res) {
	const uid = req.body.uid;
	fbDB.getUserById(uid).then(snapshot => {
		var user = snapshot.val();
		var now = dateService.now();
		if (user.activated === 'null') {
			user.activated = now;
		}
		user.logincount += 1;
		user.lastlogin = now;
		user.recent = now;
		fbDB.updateUser(uid, user).then(snapshot => {
			res.send(snapshot);
		});
	});
});

/***************************************************************************
 *                                                                         *
 *     Update user profile                                                 *
 *                                                                         *
 ***************************************************************************/
app.post('/update-profile', function (req, res) {
	const uid = req.body.uid;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	fbDB.getUserById(uid).then(snapshot => {
		var user = snapshot.val();
		user.firstName = firstName;
		user.lastName = lastName;
		fbDB.updateUser(uid, user).then(snapshot => {
			res.send(snapshot);
		});
	});
});

/***************************************************************************
 *                                                                         *
 *     Update recent activities                                            *
 *                                                                         *
 ***************************************************************************/
app.post('/recent-activity', function (req, res) {
	const uid = req.body.uid;
	fbDB.getUserById(uid).then(snapshot => {
		var user = snapshot.val();
		var now = dateService.now();
		user.recent = now;
		fbDB.updateUser(uid, user).then(snapshot => {
			res.send(snapshot);
		});
	});
});


function createSubscription(customerId, cardId, charityName, donationAmount, donationFrequency) {

	return new Promise((resolve, reject) => {
		productService.getProductByName(charityName).then(product => {
			if (product) {
				planService.createPlan(donationAmount, donationFrequency, product.id).then(newPricingPlan => {
					subscriptionService.createSubscription(customerId, newPricingPlan.id, cardId)
						.then(subscription => resolve(subscription))
						.catch(err => reject(err));
				});
			} else {
				let newProduct = {
					name: charityName,
					type: 'service',
					statement_descriptor: `Donation subscription`
				}
				planService.createPlan(donationAmount, donationFrequency, newProduct).then(newPlan => {
					subscriptionService.createSubscription(customerId, newPlan.id, cardId)
						.then(subscription => resolve(subscription))
						.catch(err => reject(err));
				});
			}
		});
	});


}
/***************************************************************************
 *                                                                         *
 *     Create new subscription for new customer                            *
 *                                                                         *
 ***************************************************************************/
app.post('/new-subscription', function (req, res) {
	const charity = req.body.charity;
	const donationAmount = req.body.donation;
	const donationFrequency = req.body.frequency;
	const authUser = req.body.user;
	const token = req.body.token;

	customerService.findOrcreateCustomer(authUser.email).then(customer => {
		stripe.customers.createSource(customer.id, {source: token.id}, function(err, card) {
			createSubscription(customer.id, card.id, charity.fields.charityName, donationAmount, donationFrequency)
			.then(result => res.send(result))
			.catch(err => res.send(err))
		});

		
		// Save card information to DB.
		fbDB.createPayment(authUser.uid, {
			id: token.id,
			brand: token.card.brand,
			customer: customer.id,
			exp_month: token.card.exp_month,
			exp_year: token.card.exp_year,
			last4: token.card.last4,
			active: true
		});
	});
});

/***************************************************************************
 *                                                                         *
 *     Create new subscription for existing customer                       *
 *                                                                         *
 ***************************************************************************/
app.post('/subscription', function (req, res) {
	const charity = req.body.charity;
	const donationAmount = req.body.donation;
	const donationFrequency = req.body.frequency;
	const authUser = req.body.user;
	const customerId = req.body.customer;
	const cardId = req.body.card_id;

	createSubscription(customerId, cardId, charity.fields.charityName, donationAmount, donationFrequency)
		.then(result => res.send(result))
		.catch(err => res.send(err));
	// productService.getProductByName(charity.fields.charityName).then(product => {

	// });
});

/***************************************************************************
 *                                                                         *
 *     Cancel Subscription                                                 *
 *                                                                         *
 ***************************************************************************/
app.post('/cancel-subscription', function (req, res) {
	const subscription_id = req.body.subscription_id;
	subscriptionService.cancelSubscription(subscription_id).then(confirmation => {
		res.send(confirmation);
	}).catch(err => {
		console.log(err);
		res.send({ err });
	});
});

/***************************************************************************
 *                                                                         *
 *     Cancel Subscription                                                 *
 *                                                                         *
 ***************************************************************************/
app.post('/update-subscription', function (req, res) {
	const subscription_id = req.body.subscription_id;
	const charityName = req.body.charity_name;
	const donationAmount = req.body.donation;
	const donationFrequency = req.body.frequency;
	const customerId = req.body.customer;

	subscriptionService.cancelSubscription(subscription_id).then(confirmation => {
		createSubscription(customerId, charityName, donationAmount, donationFrequency)
			.then(result => res.send(result))
			.catch(err => res.send(err));

	}).catch(err => {
		console.log(err);
		res.send({ err });
	});
});

/***************************************************************************
 *                                                                         *
 *    Get all cards of user.                                               *
 *                                                                         *
 ***************************************************************************/
app.post('/user-cards', function (req, res) {
	const email = req.body.email;
	customerService.getCustomersByEmail(email).then(customers => {
		let getCardsPromises = [];
		for (var i = 0; i < customers.data.length; i++) {
			getCardsPromises.push(cardService.getCards(customers.data[i].id));
		}
		Promise.all(getCardsPromises).then(cardCollection => {
			let cards = [];
			for (var i = 0; i < cardCollection.length; i++) {
				Array.prototype.push.apply(cards, cardCollection[i].data);
			}
			res.send(cards);
		});
	});
});

/***************************************************************************
 *                                                                         *
 *    Update user's card                                                   *
 *                                                                         *
 ***************************************************************************/
app.post('/update-card', function (req, res) {
	const cardId = req.body.id;
	const customerId = req.body.customer;
	const data = {
		name: req.body.name,
		address_city: req.body.city,
		address_line1: req.body.address,
		address_line2: req.body.address2,
		address_state: req.body.state,
		address_zip: req.body.zip,
		exp_month: req.body.expMonth,
		exp_year: req.body.expYear
	};
	cardService.update(customerId, cardId, data).then(card => {
		res.send(card);
	});
});

/***************************************************************************
 *                                                                         *
 *    Delete user's card                                                   *
 *                                                                         *
 ***************************************************************************/
app.post('/delete-card', function (req, res) {
	const isDelete = req.body.isDelete;
	const card = req.body.card;
	const assignedCard = req.body.assignedCard;

	let all = [];
	if(isDelete) {
		if(card.charities != undefined) {
			card.charities.forEach((charity) => {
				all.push(subscriptionService.cancelSubscription(charity.subscription.id));
			});
		}
		
	} else {
		if(card.charities != undefined) {
			card.charities.forEach((charity) => {
				all.push(subscriptionService.cancelSubscription(charity.subscription.id));
				all.push(createSubscription(assignedCard.customer, assignedCard.id
						, charity.charityname, charity.subscription.plan.amount, charity.subscription.plan.interval));
			});
		}
	}

	all.push(new Promise((resolved, rejected) => {
		stripe.customers.deleteSource(
		card.customer,
		card.id,
		function(err, confirmation) {
			resolved();	
		}
	)}));

	Promise.all(all).then(() => {
		res.send({status: 'OK'});
	}).catch(err => {
		res.send({status: 'OK'});
	});
});

/***************************************************************************
 *                                                                         *
 *    Manage APIs                                                            *
 *                                                                         *
 ***************************************************************************/
app.post('/sync-payments', function (req, res) {
	fbDB.getAllUsers().then(function (users) {
		users.forEach(function (user) {
			customerService.getCustomersByEmail(user.val().email).then(function (customers) {
				for (var i = 0; i < customers.data.length; i++) {
					cardService.getCards(customers.data[i].id).then(function (card) {
						fbDB.createPayment(user.key, {
							id: card.data[0].id,
							brand: card.data[0].brand,
							customer: card.data[0].customer,
							exp_month: card.data[0].exp_month,
							exp_year: card.data[0].exp_year,
							last4: card.data[0].last4,
							active: true
						});
					});
				}
			});
		});
	});
});

/***************************************************************************
 *                                                                         *
 *    Get All Subscription by Charities                                    *
 *                                                                         *
 ***************************************************************************/
app.post('/charities', async function (req, res) {
	let subs = await subscriptionService.getAllSubscriptions();

	
	const year = req.body.year;

	const type = req.body.type || "all";

	const segmentType = req.body.segment || "1Q";

	let month = req.body.month || 1;

	let start_month = 1;
	let end_month = 1;
	let start_date = req.body.start_date || 1;
	let end_date = req.body.end_date || 31;


	console.log('start_date', start_date);
	console.log('end_date', end_date);
	if(type == 'all') {
		start_month = 1; end_month = 12
	} else if (type == 'segment') {
		if(segmentType == '1Q') {
			start_month = 1; end_month = 3;
		} else if(segmentType == '2Q') {
			start_month = 4; end_month = 6;
		} else if(segmentType == '3Q') {
			start_month = 7; end_month = 9;
		} else if(segmentType == '4Q') {
			start_month = 10; end_month = 12;
		}
	} else if (type == 'month') {
		start_month = month; end_month = month;
	}

	console.log('year=', year);
	console.log('start_month=', start_month);
	console.log('end_month=', end_month);
	
	const subscriptions = await subscriptionService.getAllSubscriptions();

	let all = [];
	subscriptions.forEach(subscription => {

		console.log(subscription.id);
		all.push(new Promise(async (resolve) => {
			const productId = subscription.plan.product;
			const amount = subscription.plan.amount / 100;
			const interval = subscription.plan.interval;
			const customerId = subscription.customer;
			const invoices = await invoiceService.getInvoices(subscription.id, customerId);
			let totalAmountOfSub = 0;
			invoices.forEach(invoice => {
				const dt = new Date(invoice.created * 1000);
				const y = dt.getFullYear();
				const m = dt.getMonth() + 1;
				const d = dt.getDate();

				console.log('YYYYYYYYYY', y);
				console.log('MMMMMMMMMM', m);
				console.log('DDDDDDDDDD', d);

				if(y == year && m >= start_month && m <= end_month && d >= start_date && d <= end_date) {
					totalAmountOfSub += invoice.total;
				}
			});

			const product = await productService.getProduct(productId);
			let user = await fbDB.getUserByCustomer(customerId);

			let userData = {};
			user.forEach((a) => userData = a.val());
			resolve({productId: productId, product: product, user: userData, total: totalAmountOfSub, interval});
		}));
	});

	Promise.all(all).then(results => {
		
		const productMap = new Map();
		results.forEach(result => {

			console.log('++++++++++++++++++');
			const productName = result.product.name;
			const user = result.user;
			let charity = productMap.get(productName);

			if(charity == null || charity == undefined) {
				productMap.set(productName, {name: productName, product: result.product, total: result.total, users: [user]});
			} else {
				charity.total = charity.total + result.total;
				charity.users.push(user);
			}
		});
		console.log('-------------------');
		res.send(Array.from(productMap.values()));
	})
	// const chrities = new Map();
	// const productMap = new Map();

	// const products = await productService.getAllProducts();
	// const worker = new Promise(async(resolved, rejected) => {
	// 	let i = 0;
	// 	if(subs.length == 0) {
	// 		return resolved();
	// 	}
	// 	await subs.forEach(async(sub) => {
	// 		let product = chrities.get(sub.plan.product);
	
	// 		if(product == undefined || product == null) {
	// 			product = {productId: sub.plan.product, total: 0, customers: [], users: []};
	// 		} 
	// 		const invoices = await invoiceService.getInvoices(sub.id, sub.customer);
	// 		let totalAmountOfSub = 0;
	// 		invoices.forEach(invoice => {
	// 			const dt = new Date(invoice.created * 1000);
	// 			const y = dt.getFullYear();
	// 			const m = dt.getMonth() + 1;
	// 			const d = dt.getDate();

	// 			console.log('YYYYYYYYYY', y);
	// 			console.log('MMMMMMMMMM', m);
	// 			console.log('DDDDDDDDDD', d);

	// 			if(y == year && m >= start_month && m <= end_month && d >= start_date && d <= end_date) {
	// 				totalAmountOfSub += invoice.total;
	// 			}
	// 		});
	
	// 		console.log('TOTAL', totalAmountOfSub);
	// 		product.total = product.total + totalAmountOfSub;

	// 		if(totalAmountOfSub > 0) {
	// 			chrities.set(sub.plan.product, product);
	// 			const users = await fbDB.getUserByCustomer(sub.customer);
	// 			product.customers.push({customer: sub.customer});
	// 			await users.forEach(async (user) => {
	// 				const userData = await user.val();
	// 				product.users.push({id: user.key, ...userData});
	// 			});
	// 			if(productMap.has(sub.plan.product)) {
	// 				const productItem = productMap.get(sub.plan.product);
					
	// 				product.product = productItem;
	// 			} else {
	// 				const productItem = await productService.getProduct(sub.plan.product);
					
	// 				productMap.set(sub.plan.product, productItem);
	// 				product.product = productItem;
	// 			}
	// 			chrities.set(sub.plan.product, product);
	// 		}
	// 		i++;
	// 		if(i == subs.length) {
	// 			resolved(); 
	// 		}
	// 	});
	// });
	
	// await worker.then().catch();
	// res.send({products: products, charities: Array.from(chrities.values())});
});


/***************************************************************************
 *                                                                         *
 *    Get All Next month expired card by Charities                                    *
 *                                                                         *
 ***************************************************************************/
app.post('/get-next-expired-cards', async function (req, res) {
	
	var dt = new Date();

	const year = dt.getFullYear();
	const month = dt.getMonth() + 1;

	const users = await fbDB.getAllUsers();
	let cards = [];
	const promises = [];
	users.forEach(user => {
		const p = new Promise(async (resolved, rejected) => {
			const userData = user.val();
			if(userData.customerId != undefined && userData.customerId != null) {
				const data = await customerService.getCards(userData.customerId);
				resolved(data);
			} else {
				resolved({cards: []});
			}
		});

		promises.push(p);
	});

	Promise.all(promises).then(results => {
		results.forEach(data => {
			data.cards.forEach(card => {
				if(card.exp_year == year && (card.exp_month == (month + 1))) {
					cards.push({customerId: data.customerId, ...card});
				}
			});
		});
		res.send(cards);
	})
});

/***************************************************************************
 *                                                                         *
 *    Get All Next month expired card by Charities                                    *
 *                                                                         *
 ***************************************************************************/
app.post('/get-schedule', async function (req, res) {
	
	const subscriptions = await subscriptionService.getAllSubscriptions();

	let all = [];
	subscriptions.forEach(subscription => {

		console.log(subscription.id);
		all.push(new Promise(async (resolve) => {
			const productId = subscription.plan.product;
			const amount = subscription.plan.amount / 100;
			const interval = subscription.plan.interval;
			const customerId = subscription.customer;
			const product = await productService.getProduct(productId);
			let user = await fbDB.getUserByCustomer(customerId);
			let userData = {};
			user.forEach((a) => userData = a.val());
			resolve({productId: productId, product: product, user: userData, amount, interval});
		}));
	});

	Promise.all(all).then(results => {
		res.send(results);
	})
});
/***************************************************************************
 *                                                                         *
 *    Active User                                                          *
 *                                                                         *
 ***************************************************************************/
app.post('/sync-payments', function (req, res) {

});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
