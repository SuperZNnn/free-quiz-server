import nodemailer from 'nodemailer'
import { smtpCredentials } from '../config/smtp'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: smtpCredentials,
})

export const sendCodeConfirmation = async (email: string, name: string, code: string) => {
    try{
        const info = await transporter.sendMail({
            from: '"Free Quiz" <no-reply@freequiz.xyz>',
            to: email,
            subject: '📧 Seu Código de Confirmação',
            html: `
                <html lang="pt-br">
                <head>
                    <style>
                        .emailcontent{
                            width: 40vh;
                            border: .3vh solid #262473;
                            padding: 0 1vh;
                            border-radius: .5vh;
                        }
                        p.text,span{
                            text-align: justify;
                            font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
                        }
                        h1.title,h2.subject,h4.code{
                            text-align: center;
                            font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                        }
                        h4.code{
                            font-size: 1.4rem;
                        }
                    </style>
                </head>
                <body>
                    <div class="emailcontent">
                        <h2 class="subject">Seu Código de Confirmação</h2>
                        <div>
                            <p class="text">
                                Olá, ${name}<br>
                                Seu código de confirmação para validar seu e-mail é:<br>
                            </p>
                            <h4 class="code">${code}</h4>
                            <p class="text">
                                Por favor, insira esse código no nosso site/app para concluir a verificação.<br>
                                Se você não solicitou este código, ignore esta mensagem.<br><br>
                                
                                Atenciosamente,<br>
                            </p>
                            <h1 class="title">FreeQuiz</h1>
                        </div>
                        
                    </div>
                </body>
                </html>
            `
        })
    }
    catch (err){
        throw err
    }
}
export const sendChangePasswordEmail = async (email: string, name: string, code: string, callback: string) => {
    try{
        const info = await transporter.sendMail({
            from: '"Free Quiz" <no-reply@freequiz.xyz>',
            to: email,
            subject: '🔒 Redefinição de Senha',
            html: `
                <html lang="pt-br">
                <head>
                    <style>
                        .emailcontent{
                            width: 40vh;
                            border: .3vh solid #262473;
                            padding: 0 1vh;
                            border-radius: .5vh;
                        }
                        p.text,span{
                            text-align: justify;
                            font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
                        }
                        h1.title,h2.subject,h4.code{
                            text-align: center;
                            font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                        }
                        h4.code{
                            font-size: 1.4rem;
                        }

                        button.reset{
                            width: 100%;
                            font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                            font-size: 1.4rem;
                            border: none;
                            background-color: #262473;
                            color: #fff;
                            border-radius: 1vh;
                            cursor: pointer;
                        }
                    </style>
                </head>
                <body>
                    <div class="emailcontent">
                        <h2 class="subject">Mude sua senha</h2>
                        <div>
                            <p class="text">
                                Olá, ${name}<br>
                                Recebemos uma solicitação para redefinir sua senha. Para continuar, clique no link abaixo:<br>
                            </p>
                            <a href="http://localhost:5173/resetpassword/${email}/${code}?s=${callback}"><button class="reset">Alterar Senha</button></a>
                            <p class="text">
                                Se você não solicitou essa alteração, ignore este e-mail. Seu acesso permanecerá seguro.<br><br>
                                
                                Atenciosamente,<br>
                            </p>
                            <h1 class="title">FreeQuiz</h1>
                        </div>
                        
                    </div>
                </body>
                </html>
            `
        })
    }
    catch (err){
        throw err
    }
}