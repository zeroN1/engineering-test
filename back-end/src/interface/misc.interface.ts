import { ValidationChain } from "express-validator"

export interface IRoute {
    method: "get" | "post" | "put" | "delete"
    route: string
    controller: any
    action: string
    validator?: () => ValidationChain[]
}