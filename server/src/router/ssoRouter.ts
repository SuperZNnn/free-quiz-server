import { Router } from "express";
import { SsoController } from "../controller/ssoController";

const ssoRouter = Router();

ssoRouter.get('/sso/authorizeCallback/:callbackURL', SsoController.authorizeCallback)

ssoRouter.post('/sso/createRegisterCode', SsoController.createRegisterCode)
ssoRouter.post('/sso/verifyCode/:code', SsoController.RegisterWithCode)

ssoRouter.post('/sso/trylogin', SsoController.tryLogin)
ssoRouter.post('/sso/firebaseLogin', SsoController.loginFirebase)

ssoRouter.get('/sso/verifySession', SsoController.AuthTokenCred)

ssoRouter.post('/sso/sendResetPasswordEmail/:callback', SsoController.sendResetPasswordEmail)
ssoRouter.get('/sso/verifyResetToken/:email/:token', SsoController.verifyResetToken)
ssoRouter.post('/sso/changePassword/:email/:token', SsoController.resetPassword)

export default ssoRouter