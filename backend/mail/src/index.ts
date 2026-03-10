import express from 'express'
import dotenv from 'dotenv'
import { startSendOTPConsumer } from './consumer.js'
const app = express()

dotenv.config()


//rabbitmq
startSendOTPConsumer()


//server listening
const port = process.env.port
app.listen(port,()=>{
    console.log(`mail is listening at port ${port}`)
})

