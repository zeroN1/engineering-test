# Back End Engineering Test
At Boardingware, most of our back end services are written in Typescript/Javascript/Node. This project has a similar setup to some of our main web apps and technologies used as well as the structure of our applications. So hopefully this will  give you some idea of what is like to be working on the web team at Boardingware as you are working on this project.

## Technology
This project is mainly written in Typescript with Node. If you are not  familar with Typescript, you can check out this quick start guide [here](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html).

We use TypeORM for our ORM. You can check out TypeORM [here](https://typeorm.io/#/).

## The Database

We dont use SQLite for our database at Boardingware but have done so in this test to keep our back end app lightweight. You can use the command line shell as documented here: https://www.sqlite.org/cli.html to work with the database. 

These are the tables that we have generated:

```sql
CREATE TABLE roll(
   	id INT PRIMARY KEY NOT NULL,
   	name VARCHAR(255) NOT NULL,
	completed_at DATE NOT NULL
);

CREATE TABLE student(
    id INT PRIMARY KEY NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    photo_url VARCHAR(255) NOT NULL
);

CREATE TABLE student_roll_state(
   	id INT PRIMARY KEY NOT NULL,
	student_id INT NOT NULL,
	roll_id INT NOT NULL,
	state CHAR(10) NOT NULL
);

CREATE TABLE group(
   	id INT PRIMARY KEY NOT NULL,
   	name VARCHAR(255) NOT NULL,
	number_of_weeks INTEGER NOT NULL,
	roll_states VARCHAR(255) NOT NULL,
	incidents INTEGER NOT NULL,
	ltmt CHAR NOT NULL,
	run_at DATE,
	student_count INTEGER NOT NULL
);

CREATE TABLE student_group(
   	id INT PRIMARY KEY NOT NULL,
	group_id INT NOT NULL,
	student_id INT NOT NULL,
	incident_count INT NOT NULL
);
```

To open the database:

```sh
cd back-end && :sqlite3 backend-test.db
```

## How to get started and run the back end app
You will need to have Node **10.16.0** or later on your local development machine. You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows) to switch Node versions between different projects.

### First install all dependencies

```sh
cd back-end && npm i
```

### To start the back-end app

```sh
cd back-end && npm start
```

### Open app in browser

Once the app is compiled successfully you can open the browser and go to http://localhost:4001/student/get-all to see a list of students

### Access the database

To open the database:

```sh
cd back-end && :sqlite3 backend-test.db
```

## Project structure
On opening the back-end folder in Visual Studio Code and having installed the recommented plugins (vscode-eslint for linting, prettier-vscode for formatting and vscode-styled-components for auto-completing and syntax highlighting of styled-components code), you should see the project is structured as follow:

```
.
└── back-end
    └── src
        ├── controller
        ├── entity
        └── interface
```

## The test

### src/controller

This is the place for the controllers which contain the actual API functions used by the routes. The client app will call these API functions via the routes setup in routes.ts. We have three controllers:

1. GroupController - the apis for Group CRUD as well as running the Group Filters to populate the Groups with Students.
2. RollController - the apis for Roll CRUD as well as for running Student Rolls and storing the resulting Student Roll states.
3. StudentController - the apis for Student CRUD

### src/entity

This is where we have our TypeORM entities. We have one entity per database table. We are using sqlite3 for our database. In the root folder you will see the backend-test.db file which is the sqlite3 database we use. That is configured in ormconfig.json. 

### src/interface

This is where we code up our DTOs that we need.

## PostMan

You can use the tool PostMan to run the APIs against the routes. Postman can be downloaded here: https://www.postman.com/downloads/

Note, you will see in index.ts that 15 students have been added automatically to the database.

You wil be able to use Postman to do the following:

1. Get all students: GET http://localhost:4001/student/get-all
2. Create a group: POST http://localhost:4001/group/create
3. Create a roll: POST http://localhost:4001/roll/create
4. Add student roll states to the roll: POST http://localhost:4001/roll/add-student-states
5. Run the group filters: POST http://localhost:4001/group/run-group-filters
6. Get the group list: GET http://localhost:4001/group/get-all
7. Get students in a group: GET http://localhost:4001/group/get-students-in-group


## Tasks Background

A Roll is created when Staff at the School do a Roll Check to ensure the Students are all present for the Class or other Activity

Staff at the School would like to analyse these rolls. They would like to be able to create Filters that populate Groups with Students (from these Rolls). They will be able to Add as many Groups as they want. Then at any time they would like to carry out an analysis they can Run these Group Filters to populate the Groups with Students.

## The Tasks

There are two Tasks. Task 2 is more complex than Task 1. We would like you to attempt to complete both tasks. You may use PostMan to test your APIs as you complete them. You may also use PostMan to get more data into the database. 

For these tasks you will be working in the GroupController class.

### 1. Code the CreateGroup, DeleteGroup, UpdateGroup, GetGroups, and GetGroupStudents apis 

We need to be able to create groups, update groups, delete groups and get a list of the groups. We also need to be able to get a list of Students in a Group.

#### CreateGroup API

Looking at the Group table, create an API so that a Group can be created with all of the fields populated. It is important that the client provides values for these fields: name, number_of_weeks, roll_states, incidents, ltmt.

* number_of_weeks will just be an integer, representing the number of weeks for the analysis period
* roll_states will be one of the following values: "unmark" | "present" | "absent" | "late"
* incidents is an integer representing the number of times the student meets the criteria in the period
* ltmt stands for "Less Than or More Than". It will be either a "<" string or ">".

#### UpdateGroup and DeleteGroup API   	

These APIs will allow the client to update a group and delete a group. The update group API allows the user to update these fields:

* number_of_weeks will just be an integer, representing the number of weeks for the analysis period
* roll_states will be one of the following values: "unmark" | "present" | "absent" | "late"
* incidents is an integer representing the number of times the student meets the criteria in the period
* ltmt stands for "Less Than or More Than". It will be either a "<" string or ">".

#### GetGroups and GetGroupStudents APIs

The GetGroups API will return a list of groups and will contain all the group fields.
The GetGroupStudents API will return a list of the Students in the Group. It will return an arra of students and include the fields: student_id, first_name, last_name ad full_name (which concatenates the first and last names)

### 2. Code the RunGroupFilters api 

When users Run these Group Filters to do an Analysis this will happen:

1. The Students currently in each Group will be deleted
2. The Filter will be run against each Group and the Group populated with Students that match. It will also store the nuber of Incidents for the Student in the incident_count field.
3. The date the filter was "run_at" against each group will be recorded against the Group
4. The number of students in the group, "student_count", will be stored against the Group

The Group Filters we need to support are:

1. Time Period in Weeks, AND
2. One or more Roll States: "unmark" | "present" | "absent" | "late", AND
3. (Greater then the Number of Incidents in the Time Period, OR 
4. Less then the Number of Incidents in the Time Period)



