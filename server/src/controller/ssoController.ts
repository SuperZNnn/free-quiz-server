import { Request, Response } from "express";
import { TokenGenerator } from "../services/tokenGenerator";
import pool from "../config/db";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { FreeQuizSecret } from "../config/secrets";
import { sendChangePasswordEmail, sendCodeConfirmation } from "../services/emailSender";
import { ssoToken } from "../types/ssoTypes";
import { verifyIdToken } from "../services/firebase";

let RegisterCodes: ssoToken[] = []
let ResetPasswordTokens: ssoToken[] = []

let allowedCallbackUrl = [
    'http://localhost:4200/profile'
]

export class SsoController{
    private static globalScripts () {
        const now = new Date().getTime()

        // Remover códigos expirados
        RegisterCodes = RegisterCodes.filter(data => (now - new Date(data.time).getTime()) < 15 * 60 * 1000);
        ResetPasswordTokens = ResetPasswordTokens.filter(data => (now - new Date(data.time).getTime()) < 15 * 60 * 1000);
    }

    static async authorizeCallback (req: Request, res: Response){
        const { callbackURL } = req.params

        const valid = allowedCallbackUrl.includes(callbackURL)

        if (valid){
            res.status(202).send('Authorized')
        }
        else{
            res.status(401).send('Unauthorized')
        }
    }

    static async createRegisterCode (req: Request, res: Response){
        SsoController.globalScripts()
        
        const { email, name } = req.body

        const query = "SELECT * FROM users WHERE email = ?"
        pool.query(query, [email], async (err, response: any[])=>{
            if (err){
                res.status(500).send('Erro interno')
                return
            }

            if (response.length === 0){
                const foundedId = RegisterCodes.findIndex((data) => data.email === email)
        
                if (foundedId < 0){
                    const token = TokenGenerator(6)

                    const userRegister = {
                        email,
                        token,
                        time: new Date
                    }

                    await sendCodeConfirmation(email, name, token)

                    RegisterCodes.push(userRegister)

                    res.status(201).send('E-mail enviado')
                }
                else{
                    res.status(200).send('Já foi enviado')
                }
            }
            else{
                res.status(401).send('E-mail já cadastrado')
            }
        })
        
    }
    static async RegisterWithCode(req: Request, res: Response){
        SsoController.globalScripts()

        const { code } = req.params
        const { email, password, name } = req.body
        
        const query = "SELECT * FROM users WHERE email = ?"
        pool.query(query, [email], async (err, response: any[]) => {
            if (err){
                res.status(500).send("Erro Interno")
                return
            }

            if (response.length === 0){
                const foundedId = RegisterCodes.findIndex((data) => data.token === code && data.email === email)

                if (foundedId >= 0){
                    const hashedPassword = await bcrypt.hash(password, 10)
                    const query = "INSERT INTO users (name, email, password) VALUES (?,?,?)"

                    pool.query(query, [name, email, hashedPassword], (err) => {
                        if (err){
                            res.status(500).send('Erro interno')
                            return
                        }

                        RegisterCodes.splice(foundedId, 1)

                        pool.query("SELECT * FROM users WHERE email = ?", [email], (err, response: any[])=> {
                            if (err){
                                res.status(500).send('Erro interno')
                                return
                            }

                            const user = { id: response[0].id, email: email }
                            const jwtToken = jwt.sign(user,FreeQuizSecret,{expiresIn: '4h'})

                            res.cookie('freeQuizToken', jwtToken, {
                                httpOnly: true,
                                secure: false,
                                sameSite: 'lax',
                                domain: 'localhost',
                                path: '/',
                                maxAge: 60*60*1000
                            })

                            res.status(201).send('Usuário cadastrado')
                        })
                    })
                }
                else{
                    res.status(404).send('User not Found')
                }
            }
            else{
                res.status(401).send('E-mail já cadastrado')
            }
        })

        
    }

    static async tryLogin(req: Request, res: Response){
        SsoController.globalScripts()

        const { email, password } = req.body

        const query = "SELECT * FROM users WHERE email = ?"
        pool.query(query, [email], async (err, response: any[])=> {
            if (err){
                res.status(500).send('Erro interno')
                return
            }

            if (response.length > 0){
                const compare = await bcrypt.compare(password, response[0].password)

                if (compare){
                    const user = { id: response[0].id, email: email }
                    const jwtToken = jwt.sign(user,FreeQuizSecret,{expiresIn: '4h'})

                    res.cookie('freeQuizToken', jwtToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'lax',
                        domain: 'localhost',
                        path: '/',
                        maxAge: 60*60*1000
                        
                    })
                    
                    res.status(202).send('Usuário logado')
                }
                else{
                    res.status(401).send('Senha incorreta')
                }
            }
            else{
                res.status(404).send('Usuário não encontrado')
            }
        })
    }

    static async AuthTokenCred (req: Request, res: Response){
        SsoController.globalScripts()

        try {
            const token = req.cookies.freeQuizToken

            if (!token) {
                res.status(401).json({ message: 'Não autorizado' });
                return
            }

            const user = jwt.verify(token, FreeQuizSecret);
            res.status(200).send({user});
        }
        catch (err) {
            res.status(403).json({ message: 'Token inválido' });
        }
    }

    static async sendResetPasswordEmail (req: Request, res: Response){
        SsoController.globalScripts()

        const { email } = req.body
        const { callback } = req.params
        
        const query = "SELECT * FROM users WHERE email = ?"
        pool.query(query, [email], (err, response: any[]) => {
            if (err){
                res.status(500).send('Erro interno')
                return
            }

            const foundedId = ResetPasswordTokens.findIndex((data)=> data.email === email)
            if (foundedId >= 0){
                res.status(401).send('E-mail já enviado')
            }
            else{
                if (response.length > 0){
                    const token = TokenGenerator(8)
    
                    const user = {
                        email,
                        token,
                        time: new Date
                    }
                    ResetPasswordTokens.push(user)
    
                    sendChangePasswordEmail(email,response[0].name,token,callback)
                    res.status(200).send('E-mail enviado')
                }
                else{
                    res.status(404).send('Not found')
                }
            }
        })
    }
    static async verifyResetToken (req: Request, res: Response){
        SsoController.globalScripts()

        const { email, token } = req.params

        const foundedId = ResetPasswordTokens.findIndex((data)=> data.email === email && data.token === token)

        if (foundedId >= 0){
            res.status(202).send('Accepted')
        }
        else{
            res.status(404).send('Not found')
        }
    }
    static async resetPassword (req: Request, res: Response){
        SsoController.globalScripts()

        const { email, token } = req.params
        const { password } = req.body

        const foundedId = ResetPasswordTokens.findIndex((data)=> data.email === email && data.token === token)

        if (foundedId >= 0){
            pool.query('SELECT * FROM users WHERE email = ?', [email], async (err, response: any[])=>{
                if (err){
                    res.status(500).send('Erro interno')
                    return
                }

                const isEqual = await bcrypt.compare(password, response[0].password)
                if (isEqual){
                    res.status(400).send('A senha não pode ser igual a anterior')
                    return
                }

                const query = "UPDATE users SET password = ? WHERE email = ?"

                const hashedPassword = await bcrypt.hash(password, 10)

                pool.query(query, [hashedPassword, email], (err) => {
                    if (err){
                        res.status(500).send('Erro interno')
                        return
                    }

                    ResetPasswordTokens.splice(foundedId,1)

                    pool.query('SELECT * FROM users WHERE email = ?', [email], (err, response: any[])=> {
                        if (err){
                            res.status(500).send('Erro interno')
                            return
                        }
                        
                        const user = { id: response[0].id, email: email }
                        const jwtToken = jwt.sign(user,FreeQuizSecret,{expiresIn: '4h'})

                        res.cookie('freeQuizToken', jwtToken, {
                            httpOnly: true,
                            secure: false,
                            sameSite: 'lax',
                            domain: 'localhost',
                            path: '/',
                            maxAge: 60*60*1000
                        })

                        res.status(200).send('Senha alterada')
                    })
                })
            })

            
        }
        else{
            res.status(404).send('Not found')
        }
    }

    static async loginFirebase (req: Request, res: Response){
        const { token } = req.body;

        verifyIdToken(token)
        .then(response=>{
            const query = "SELECT * FROM users WHERE email = ?"

            pool.query(query, [response.email], (err, resp: any[])=>{
                if (err){
                    res.status(500).send('Erro interno')
                    return
                }

                if (resp.length > 0){
                    const user = { id: resp[0].id, email: response.email }
                    const jwtToken = jwt.sign(user,FreeQuizSecret,{expiresIn: '4h'})

                    res.cookie('freeQuizToken', jwtToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'lax',
                        domain: 'localhost',
                        path: '/',
                        maxAge: 60*60*1000
                    })

                    res.status(202).send('Logado')
                }
                else{
                    pool.query('INSERT INTO users (name, email) VALUES (?,?)', [response.name,response.email], (err)=>{
                        if (err){
                            res.status(500).send('Erro interno')
                            return
                        }

                        pool.query('SELECT * FROM users WHERE email = ?', [response.email], (err, resp: any[])=>{
                            if (err){
                                res.status(500).send('Erro interno')
                                return
                            }

                            if (resp.length> 0){
                                const user = { id: resp[0].id, email: response.email }
                                const jwtToken = jwt.sign(user,FreeQuizSecret,{expiresIn: '4h'})

                                res.cookie('freeQuizToken', jwtToken, {
                                    httpOnly: true,
                                    secure: false,
                                    sameSite: 'lax',
                                    domain: 'localhost',
                                    path: '/',
                                    maxAge: 60*60*1000
                                })

                                res.status(201).send('Created')
                            }
                            else{
                                res.status(404).send('Not found')
                            }
                        })
                    })
                }
            })
        })
        .catch(err=>{
            res.status(500).send(err)
        })
    }
}