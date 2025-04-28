import express from 'express'
import { UserRouter } from './routes/userRoutes/user'
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import PrismaCl from './prisma';
import { BankRouter } from './routes/bankRoutes/bank';
import cors from 'cors'
let mp = new Map()

const app = express()
const wss1 = new WebSocketServer({ noServer: true });
const server = createServer(app);
wss1.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on("message", (message: any) => {
        const parsedMessage = JSON.parse(message)

        if (parsedMessage.type === "init") {
            mp.set(parsedMessage.id, ws)
        } else if (parsedMessage.type === "message") {
            mp.get(parsedMessage.senderId)?.send(parsedMessage)
            // const create = async ()=>{
            //     await PrismaCl.messages.create({
            //         data: {
            //             senderId: parseInt(parsedMessage.senderId,10),
            //             receiverId: parseInt(parsedMessage.senderId),
            //             message: parsedMessage.message
            //         }
            //     })
            // }

            // PrismaCl.messages.create({
            //     data: {
            //         userId: parsedMessage.receiverId,
            //         message: parsedMessage.message
            //     }
            // })
        }
    })


});
server.on('upgrade', (request, socket, head) => {
    wss1.handleUpgrade(request, socket, head, (ws) => {
        wss1.emit('connection', ws, request);
    });
});




app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors());
app.use("/api/v1/user", UserRouter)
app.use("/api/v1/bank", BankRouter)


app.listen(3000, () => {
    console.log("listening....")
})
