# Orah Engineering Test (Back End) Solution

## Introduction

Firstly, thanks to Anirudh and the team at Orah for allowing me an opportunity to participate in this assessment. I really enjoyed it and learned a lot from the experience particularly about Typeorm since I have been meaning to pick up this library for a while and this assessment gave the perfect opportunity to do that. In this readme, I will present my understanding of the problem statement, a detailed discussion of the solution presented and other notable aspects that I found of intrigue or where I have added extra logic/code that was not asked for.

## Problem Statement

Schools use `Roll` as an entity to mark the attendance of students. A roll entity can be used for any day of a school week, for an event (science fair, festival, etc.,) or tracking online presence as well. The entity is flexible enough to be used for tracking student activity. The schema is explained below:

```js
{
	name: "Name of the roll for example Week1Day1",
	completed_at: "A timestamp that denotes when the roll entry was created"
}
```

For each student in the class/group/activity, a mapping is created that marks the a roll entry to a student (aka `StudentRollState`). This looks like the following:

```js
{
	roll_id: "ID of the roll entry",
	student_id: "ID of the student being tracked",
	state: "A string that marks the state of student (unmark, absent, present, late) or a comma separated combination of these values"
}
```

Schools now want to analyze students using the roll data. To do this, they want to create `Group` such that each group entry can define a set of filtering parameters that can be applied to find out how many students are part of a defined group (if any). A group has the following structure:

```js
{
	name: "Name of the group like Consistently Late",
	incidents: "Defines how many counts of activity (state in StudentRollState) is needed to qualify for this group",
	number_of_weeks: "Defines how many weeks of data needs to be analyzed for this particular group",
	ltmt: "The comparison operator (either < or >). This is used in the filter query to compare counts of incidents",
	run_at: "The time when the filter was last run",
	student_count: "The count of students in the group. This is updated each time the filter is run"
}
```

The above group parameters are used for each group to generate an extra mapping (aka `GroupStudent`) for lookup of a student in a particular group which has the following structure:

```js
{
	student_id: "ID of the student in the group",
	group_id: "ID of the group the student falls under",
	incident_count: "Number of incidents counted for this student"
}
```

`GroupStudent` mapping is recreated from new each time the filters are run. Running the filters mean taking each group in the DB, executing the filter using the query parameters defined, updating the group's `run_at` and `student_count` and finally mapping each student to a group in `GroupStudent` relation.

The problem required an implementation of the Group Lifecycle APIs (or CRUD endpoints), an endpoint for mapping student information to a group and finally running the filters and populating the `GroupStudent` relation.

## Group API

The following endpoints are defined for the `Group` entity:

1. **GET /group/get-all**: Returns a list of all groups defined in the DB

2. **POST /group**: Creates a new group with all the parameters as discussed above defined for the group

3. **PUT /group**: Updates an existing group. The parameters are same as in create but also includes an `id` which is the ID of the group to be updated

4. **DELETE /group/:id**: Deletes the group with the provided ID in the path parameters

5. **GET /group/:id/student**: Gets all the students for a group as specified by the `id`. This can return an empty array if the group has no students. It also assumes that the filters have been run before calling this endpoint

6. **GET /group/run-filters**: Runs all the filters for each group in DB and repopulate the `GroupStudent` mapping. All previous mappings are removed before repopulating

Check the Postman API definition included for details on each request.

## Other Notable Changes

1. Updating the routing system to include validation

The routing type was changed to support `validator` property which returns a function which returns a `ValidationChain[]` as defined by `express-validator` package. All validators for each API entity is defined under `src/validators` folder. Each file is named after an entity which has an API and contains all the validators for all route paths (paths that has dynamic path parameters, get parameters or JSON body payload).

The modified mapping looks as follows:

```js
{
    method: "post",
    route: "/student/create",
    controller: StudentController,
    action: "createStudent",
    validator: CreateStudentValidator()
}
```

where `CreateStudentValidator` is defined as follows in `src/validator/student.validator.ts`:

```js
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
```

The above simply returns a function when called which can be used when registering route and handlers. The validation in the above example checks for the existence of first and last name, checks if they are `string` and checks if the length is between 2 and 100 inclusive.

2. Changes to the route registration code

The following code was being used in `index.ts` which serves as the bootstrap file for the entire application server:

```js
Routes.forEach((route) => {
	;(app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
	const result = new (route.controller as any)()[route.action](req, res, next)
	if (result instanceof Promise) {
		result.then((result) => (result !== null && result !== undefined ? res.send(result) : undefined))
	} else if (result !== null && result !== undefined) {
		res.json(result)
	}
	})
})
```

In the above code, there is the following issue:

A controller have multiple methods (or actions). For each route, to reference an action, a new controller is defined. The use of controller is like that of a Singleton since each object does not maintain statefulness. As such the following code was creating unnecessary objects such that for `StudentController` which defines 4 routes and 4 actions, 4 instances of the controller will be created although a single instance would suffice.

To address this issue and avoid multiple instances of the same controller, the following changes were added:

```js
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
	}
	
	const result = ctrl[route.action](req, res, next)
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

```
The above code make sure that multiple instances are not defined by using a map for each controller. It also adds a further check for `Promise` that does not resolve to a value i.e., `Promise<void>` and returns an appropriate JSON response. It also sends an appropriate error for each promise rejection (namely 500 "Server Error"). Finally, if no response is returned by the route handler (aka action) and no error was triggered, then it is assumed everything went as expected and a default success response is sent. Also, validation is performed for each route as expected.

3. An Error MW

A simple error MW and an error type `ApiError` was used for handling error centrally in the application. For each handler, it can pass a new instance of `ApiError` with appropriate code and message to the `next` function to trigger the error MW. 