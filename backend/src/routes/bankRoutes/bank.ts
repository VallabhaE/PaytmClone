import PrismaCl, { SECRET } from "../../prisma";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { FailedAny, Success, SuccessAny } from "../../models/responseModels";
const BankRouter = Router()

const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers['authorization']?.split(' ')[1]; // 'Bearer <token>'

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return
    }

    // Step 2: Verify the token
    try {
        const ver = jwt.verify(token, SECRET); // Verify the token
        if (typeof ver !== 'string') {
            req.headers.id = ver.userId;
            console.log(ver.userId);
            next();

        }
    } catch (err) {
        console.error('Invalid token:', err);
    }

};


BankRouter.get("/get-user-info", authenticate, async (req, res) => {
    try {
        const user = await PrismaCl.user.findFirst({
            where: {
                id: parseInt(req.headers.id as string, 10),
            },
            include: {
                notif: true
            }
        })
        res.status(200).send(SuccessAny({
            msg: "User Found With Bank Balane is " + user?.BankBalance,
            username: user?.username,
            email: user?.email,
            balance: user?.BankBalance,
            notif: user?.notif
        }))
    } catch (err) {
        res.status(200).send(FailedAny(err))
    }
})


BankRouter.post("/get-filter", async (req, res) => {
    const search = req.body.search

    try {
        const users = await PrismaCl.user.findMany({
            where: {
                username: {
                    contains: search,
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
            }
        })

        res.status(200).send(SuccessAny({
            msg: "Available Data",
            users: users
        }))
    } catch (err) {
        res.status(200).send(FailedAny(err))

    }
})

BankRouter.post("/pay", authenticate, async (req, res) => {
    const receiverId = parseInt(req.body.receiverId)
    const senderId = parseInt(req.headers.id as any)
    const amount = parseInt(req.body.amount)

    if (isNaN(receiverId) || isNaN(senderId) || isNaN(amount)) {
        res.status(400).send({ message: "Invalid input" });
        return
    }

    try {
        const sender = await PrismaCl.user.findFirst({
            where: {
                id: senderId
            }
        })

        if (sender) {
            if (sender.BankBalance < amount) {
                res.status(400).json(FailedAny("Not Enogh Balance" + sender.BankBalance))
                return
            }
        }
        const transaction = await PrismaCl.$transaction([
            PrismaCl.user.update({
                where: {
                    id: senderId
                },
                data: {
                    BankBalance: {
                        decrement: amount
                    }
                }
            }),
            PrismaCl.user.update({
                where: {
                    id: receiverId
                },
                data: {
                    BankBalance: {
                        increment: amount
                    }
                }
            })
        ])
        res.status(200).json(Success("Tranaction Successfull"))
    } catch (err) {
        res.status(400).json(FailedAny(err))
    }
})


BankRouter.post('/messages', authenticate, async (req, res) => {
    const receiverId = parseInt(req.headers.id as any, 10)
    const senderId = parseInt(req.body.senderId, 10)

    try {
        const messages = await PrismaCl.user.findFirst({
            where: {
                id: receiverId
            },
            include: {
                messages: true,
            }
        });
        const msgs = messages?.messages.filter(obj => obj.senderId == senderId)
        res.status(200).json(SuccessAny({
            msg: "Tranaction Successfull",
            data: msgs
        }))
    } catch (err) {
        res.status(400).json(FailedAny(err))
    }
})

export { BankRouter }