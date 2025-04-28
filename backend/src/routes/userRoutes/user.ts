import express, { Router } from "express";
import zod from 'zod'
import { FailedAny, Success, SuccessAny } from "../../models/responseModels";
import PrismaCl, { SECRET } from "../../prisma";
import jwt from 'jsonwebtoken'
const signInSchema = zod.object({
    username: zod.string().min(5),
    password: zod.string().min(5)
})
const signUpSchema = zod.object({
    username: zod.string().min(5),
    password: zod.string().min(5),
    phoneNumber: zod.string().length(10),
    email: zod.string().email()
})
const UserRouter = Router()

UserRouter.post("/signin", async (req, res) => {
    try {
        const body = signInSchema.parse(req.body)
        const username = body.username
        const password = body.password
        const user = await PrismaCl.user.findFirst({
            where: {
                password: password,
                username: username
            }
        })
        const signature = jwt.sign({
            userId: user?.id
        }, SECRET)
        res.status(200).send(SuccessAny({
            msg: "User Found With Bank Balane is " + user?.BankBalance,
            username: user?.username,
            email: user?.email,
            balance: user?.BankBalance,
            payload: signature
        }))
    } catch (err) {
        res.status(200).send(FailedAny(err))
    }
})


UserRouter.post("/signup", async (req, res) => {
    try {
        const body = signUpSchema.parse(req.body)
        const username = body.username
        const email = body.email
        const phoneNumber = body.phoneNumber
        const password = body.password
        const user = await PrismaCl.user.create({
            data: {
                email: email,
                username: username,
                password: password,
                BankBalance: 0
            },
        });


        res.status(200).json(Success(user.email + "Has been created Successfully with bank balance " + user.BankBalance))

    } catch (err) {
        res.status(400).json(FailedAny(err))
    }


})


export { UserRouter }