const bcrypt = require('bcryptjs')
const validator = require('validator')
const mongoose = require('../../database/index')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        select: false
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value);
            },
            message: props => `'${props.value}' is not a valid e-mail.`
        }
    },
    password: {
        type: String,
        require: true,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

UserSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 10)
    next();    
})

module.exports = mongoose.model('User', UserSchema);