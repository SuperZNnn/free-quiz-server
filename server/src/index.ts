import express, { json } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import ssoRouter from './router/ssoRouter'

const app = express()
const port = 3000

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:4200'], // Permite requisições desses domínios
    credentials: true, // Permite o envio de cookies
};

app.use(cors(corsOptions));
app.use(json())
app.use(cookieParser())

app.use(ssoRouter)

app.listen(port, ()=> {
    console.log(`Server running on http://localhost:${port}`)
})