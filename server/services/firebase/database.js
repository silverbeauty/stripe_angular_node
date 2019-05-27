module.exports = function(database) {
    return {
        // Get all users
        getAllUsers: function(){
            return database.ref('/users').once('value');
        },
        // Get a user by uid.
        getUserById: function(uid) {
            return database.ref('/users/' + uid).once('value');
        },
        // Get a user by email
        getUserByEmail: function(email) {
            return database.ref('users').orderByChild("email").equalTo(email).once("value");
        },
        // Get a user by customerId
        getUserByCustomer: function(customerId) {
            return database.ref('users').orderByChild("customerId").equalTo(customerId).once("value");
        },
        // Create new user
        createUser: function(uid, data) {
            return database.ref('users/' + uid).set(data);
        },
        // Update user
        updateUser: function(uid, data) {
            //var updates = {};
            //updates['/users/' + uid] = data;
            return database.ref('/users/' + uid).update(data);
        },
        // Create user's new payment
        createPayment: function(uid, data) {
            return database.ref('payments/' + uid).push(data);
        }
    }
}
