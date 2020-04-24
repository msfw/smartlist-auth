const bcrypt = require('bcryptjs');

module.exports = {
    async UserExists(User, conditions) {
        return User.findOne(conditions);
    },
    async IsValidUserPassword(passwordFromBodyRequest, passwordFromDatabase) {        
        return bcrypt.compare(passwordFromBodyRequest, passwordFromDatabase);
    }
}
