import { NextFunction, Request, Response } from "express"

export function apiErrorMw(error: ApiError, req: Request, res: Response, next: NextFunction) {
    if(res.headersSent) {
        // delegate to default handler
        return next(error)
    }
    let err;
    console.error(error)
    if(typeof error.toJSON === "function") {
        err = error.toJSON()
    } else if(typeof error.code === "number") {
        err = {
            status: error.code,
            message: error.message
        }
    } else {
        err = {
            status: 500,
            message: "Server Error"
        }
    }
    return res.status(error.code ? error.code : 500).json(err)
}

export class ApiError extends Error {
    public code: number

    constructor(code: number, message: string) {
        super(message)
        this.code = code
    }

    toJSON() {
        return {
            status: this.code,
            message: this.message
        }
    }
}