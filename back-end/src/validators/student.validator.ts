import { body, param, ValidationChain } from "express-validator"

export function GetStudentValidator() {
    return function(): ValidationChain[] {
        return [
            param("id", "Student ID is missing")
                .exists()
                .isInt({ min: 1 })
        ]
    }
}

export function CreateStudentValidator() {
    return function(): ValidationChain[] {
        return [
            body("first_name", "Student must have first name")
                .exists()
                .isString()
                .isLength({ min: 2, max: 100 }),
            
            body("last_name", "Student must have last name")
                .exists()
                .isString()
                .isLength({ min: 2, max: 100 })
        ]
    }
}

export function UpdateStudentValidator() {
    return function(): ValidationChain[] {
        return [
            body("id", "Student ID must be provided")
                .exists()
                .isInt({ min: 1 }),
        ]
    }
}

export function DeleteStudentValidator() {
    return GetStudentValidator()
}