import { Prisma } from "@prisma/client"

export const toErrorResponse = (error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            return {
                status: 409,
                body: {
                    success: false,
                    message: "Unique value already exists",
                    meta: error.meta,
                },
            }
        }
    }

    const message =
        error instanceof Error ? error.message : "Internal server error"

    return {
        status: 500,
        body: {
            success: false,
            message,
        },
    }
}
