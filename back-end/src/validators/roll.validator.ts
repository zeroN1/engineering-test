import { body, param, ValidationChain } from "express-validator"


function validateRollState(params: Array<any>) {
    for(const param of params) {
        if(!param.student_id || typeof param.student_id !== "number" || param.student_id < 1) {
            return false
        }
        if(!param.roll_id || typeof param.roll_id !== "number" || param.roll_id < 1) {
            return false
        }
        const findComma = param.state.indexOf(",")
        const validStates = new Set([
            "present", "absent", "late", "unmark"
        ])
        let states = []
        if(findComma < 0) {
            states.push(param.state)
        } else {
            states = states.concat(param.state.split(","))
        }

        for(const state of states) {
            if(!validStates.has(state)) {
                return false
            }
        }
    }
    return true
}
export function CreateRollValidator() {
    return function(): ValidationChain[] {
        return [
            body("name", "Roll must have a name and have 2 <= length <= 100")
                .exists()
                .isString()
                .isLength({ min: 2, max: 100 })
        ]
    }
}

export function UpdateRollValidator() {
    return function(): ValidationChain[] {
        return [
            body("id", "Roll ID must be provided")
                .exists()
                .isInt({ min: 1 })
        ]
    }
}

export function GetRollValidator() {
    return function(): ValidationChain[] {
        return [
            param("id", "Roll ID must be provided")
                .exists()
                .isInt({ min: 1 })
        ]
    }
}

export function DeleteRollValidator() {
    return GetRollValidator()
}

export function CreateRollStateValidator() {
    return function(): ValidationChain[] {
        return [
            body("params", "Roll State input is malformed")
                .custom((params: Array<any>) => validateRollState([params]))
        ]
    }
}

export function CreateRollStatesValidator() {
    return function(): ValidationChain[] {
        return [
            body("params", "Roll State input is malformed")
                .custom((params: Array<any>) => validateRollState(params))
        ]
    }
}

export function UpdateRollStateValidator() {
    return function(): ValidationChain[] {
        return [
            ...CreateRollStateValidator()(),
            body("id", "Roll State ID must be provided")
                .exists()
                .isInt({ min: 1 })
        ]
    }
}