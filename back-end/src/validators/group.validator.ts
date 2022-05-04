import { body, param, ValidationChain } from "express-validator"

export function CreateGroupValidator() {
    return function(): ValidationChain[] {
        return [
            body("name", "Group must have a name and have 2 <= length <= 100 ")
                .exists()
                .isString()
                .isLength({ min: 2, max: 100 }),
            body("number_of_weeks", "Group must have 1 <= number of weeks <= 52")
                .exists()
                .isInt({ min: 1, max: 52 }),
            body("incidents", "Group must have incident of at least 1")
                .exists()
                .isInt({ min: 1 }),
            body("ltmt", "Group must have < or > operator defined")
                .exists()
                .custom(op => {
                    if(op === "<" || op === ">") {
                        return true
                    }
                    return false
                }),
            body("roll_states", "Group must have at least 1 roll states")
                .exists()
                .isString()
                .custom((state: string) => {
                    const findComma = state.indexOf(",")
                    const validStates = new Set([
                        "present", "absent", "late", "unmark"
                    ])
                    let states = []
                    if(findComma < 0) {
                        states.push(state)
                    } else {
                        states = states.concat(state.split(","))
                    }

                    for(const state of states) {
                        if(!validStates.has(state)) {
                            return false
                        }
                    }
                    return true
                })
        ]
    }
}

export function UpdateGroupValidator() {
    return function(): ValidationChain[] {
        return [
            body("id", "Group ID must be provided")
                .exists()
                .isInt({ min: 1 })
        ]
    }
}

export function GetGroupValidator() {
    return function(): ValidationChain[] {
        return [
            param("id", "Group ID must be provided")
                .exists()
                .isInt({ min: 1 })
        ]
    }
}

export function DeleteGroupValidator() {
    return GetGroupValidator()
}

export function GetGroupStudentsValidator() {
    return GetGroupValidator()
}