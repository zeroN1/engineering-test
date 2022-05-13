import "reflect-metadata"
import { createConnection } from "typeorm"
import * as express from "express"
import { validationResult } from "express-validator"
import * as bodyParser from "body-parser"
import * as cors from "cors"
import { Request, Response } from "express"
import { Routes } from "./routes"
import { Student } from "./entity/student.entity"
import { insertSampleData } from "./testdata"
import { IRoute } from "./interface/misc.interface"
import { ApiError, apiErrorMw } from "./errors"

createConnection()
  .then(async (connection) => {
    // create express app
    const app = express()
    app.use(cors())
    app.use(bodyParser.json())

    // register express routes from defined application routes
    // Note: the following code has one issue:
    // A controller have multiple methods (or actions)
    // for each route, to reference an action, a new controller
    // is defined. The use of controller is like that of a Singleton
    // since each object does not maintain statefulness. As such
    // the following code was creating unnecessary objects
    // A modification was made to make sure only one instance of
    // each Controller is ever created and all actions of that 
    // Controller type belongs to the only defined Controller instance

    /*Routes.forEach((route) => {
      ;(app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
        const result = new (route.controller as any)()[route.action](req, res, next)
        if (result instanceof Promise) {
          result.then((result) => (result !== null && result !== undefined ? res.send(result) : undefined))
        } else if (result !== null && result !== undefined) {
          res.json(result)
        }
      })
    })*/
    const ctrls = {}
    Routes.forEach((route: IRoute) => {
      let validator: any = route.validator
      if(!validator) {
        validator = [] 
      } else {
        validator = validator()
      }

      (app as express.Application)[route.method](route.route, validator, (req: Request, res: Response, next: express.NextFunction) => {
        // if no validators are defined, assume valid by default
        const validResult = !validator ? null : validationResult(req)
        if(validResult && !validResult.isEmpty()) {
          return next(new ApiError(400, validResult.array().map(e => e.msg).join("\n")))
        }
        const key = (route.controller as Object).constructor.name
        let ctrl;
        if(ctrls[key]) {
          ctrl = ctrls[key]
        } else {
          ctrl = new (route.controller)()
          ctrls[key] = ctrl
          console.log(ctrls)
        }
        
        const result = ctrl[route.action](req, res, next)
        //console.log(ctrl)
        if(result instanceof Promise) {
          result
            .then((result) => result !== undefined && result !== null ? res.send(result) : res.json({ status: 200, message: 'OK'}))
            .catch(e => {
              console.error(e)
              return next(new ApiError(500, "Server Error"))
            })
        } else if(result !== undefined && result !== null) {
          res.json(result)
        } else {
          // no error and also no result; just return a dummy ok response
          res.json({
            status: 200,
            message: "Ok"
          })
        }
      })
    })
    console.log(ctrls)
    // mount error MW here
    app.use(apiErrorMw)
    
    // start express server
    app.listen(4001)

    // insert 15 students

    await insertSampleData(connection.manager)
    console.log("Express server has started on port 4001. Open http://localhost:4001/student/get-all to see results")
  })
  .catch((error) => console.log(error))
