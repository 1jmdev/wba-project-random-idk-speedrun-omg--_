import { Hono } from "hono"
import { prisma } from "./lib/prisma"

const app = new Hono()

app.get("/api", async (c) => {
    const user = await prisma.user.create({
        data: {
            name: "Alice",
            email: "alice@prisma.io",
            posts: {
                create: {
                    title: "Hello World",
                    content: "This is my first post!",
                    published: true,
                },
            },
        },
        include: {
            posts: true,
        },
    })

    console.log("Created user:", user)

    const allUsers = await prisma.user.findMany({
        include: {
            posts: true,
        },
    })
    console.log("All users:", JSON.stringify(allUsers, null, 2))

    return c.json({ message: "Hello from Hono!" })
})

export default app
