const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/user')
const messaging = require('../../config/queues')
const publisherAuth = require('../../modules/rabbit/publisher/PublisherBase')
const authValidations = require('../../validations/authValidation')

const generateToken = (params = {}) => {
    return jwt.sign(params, process.env.SHARED_SERVICES_INFO_SECRET, {
        expiresIn: 86400 // 1 day
    })
}

module.exports = {

    async register(req, res) {
        const { email } = req.body;

        try {

            const { status, description } = res.__('createUserFailed').userExists

            if (await authValidations.UserExists(User, { email }))
                return res.status(status).send({ error: description })

            const user = await User.create(req.body);
            user.password = undefined;

            return res.send({ user, token: generateToken({ id: user.id }) })
        } catch (error) {

            const { status, description } = res.__('createUserFailed').registerFailed

            res.status(status).send({ error: description })
        }
    },

    async authenticate(req, res) {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        const authenticationFailed = res.__('authenticationFailed');
        const userNotFoundErrors = authenticationFailed.userNotFound;
        const invalidPasswordErrors = authenticationFailed.invalidPassword;

        if (!user)
            return res.status(userNotFoundErrors.status)
                .send({ error: userNotFoundErrors.description });

        if (!await authValidations.IsValidUserPassword(password, user.password))
            return res.status(invalidPasswordErrors.status)
                .send({ error: invalidPasswordErrors.description });

        user.password = undefined;

        res.send({ user, token: generateToken({ id: user.id }) })
    },

    async resetPassword(req, res) {                
        const { email, token, newPassword, oldPassword = '', manualReset = false } = req.body;  
        const resetPasswordErrors = res.__('resetPasswordErrors');             
        
        try {
            const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires password')


            if (!user)
                res.status(resetPasswordErrors.userNotFound.status).send(resetPasswordErrors.userNotFound.description)

            if (!manualReset) {
                
                if (!token)
                    res.status(resetPasswordErrors.resetPassTokenRequired.status)
                        .send(resetPasswordErrors.resetPassTokenRequired.description)

                if (user.passwordResetToken != token)
                    res.status(resetPasswordErrors.invalidToken.status)
                        .send(resetPasswordErrors.invalidToken.description)

                if (Date.now() > user.passowordResetExpires)
                    res.status(resetPasswordErrors.tokenExpired.status)
                        .send(resetPasswordErrors.tokenExpired.description)

            } else {
                if (!await authValidations.IsValidUserPassword(oldPassword, user.password))
                    res.status(resetPasswordErrors.oldPassword.status)
                        .send(resetPasswordErrors.oldPassword.description)
            }

            user.password = newPassword;

            await user.save();

            res.send()

        } catch (error) {
            res.status(400).send({ error: 'Erro while trying to update password.', details: error })
        }
    },

    async forgotPassword(req, res) {
        const { email } = req.body;
        const forgotPasswordErros = res.__('forgotPasswordFailed').userNotFound;

        try {

            const user = await User.findOne({ email }).select('+name')

            if (!user)
                res.status(forgotPasswordErros.status).send(forgotPasswordErros.description)

            const token = crypto.randomBytes(20).toString('hex');

            const tokenExpiration = new Date()
            tokenExpiration.setHours(tokenExpiration.getHours() + 1)

            await user.update({
                passwordResetToken: token,
                passwordResetExpires: tokenExpiration
            });

            publisherAuth(JSON.stringify({
                to: email,
                subject: 'Forgot Password',
                template: 'forgot password',
                context: { token, name: user.name }
            }), messaging.forgotPasswordPublisher.queues, messaging.forgotPasswordPublisher.exchange)
                .catch(err => console.log(err));

            res.send(`Please, verify your e-mail account '${email}' to get reset password token.`);

        } catch (error) {
            res.status(400).send('Erro while trying to recover password.' + error)
        }
    }
}