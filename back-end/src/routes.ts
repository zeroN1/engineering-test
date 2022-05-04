import { StudentController } from "./controller/student-controller"
import { RollController } from "./controller/roll-controller"
import { GroupController } from "./controller/group-controller"
import {
  CreateStudentValidator,
  DeleteStudentValidator,
  GetStudentValidator,
  UpdateStudentValidator
} from "./validators/student.validator"
import {
  CreateGroupValidator,
  UpdateGroupValidator,
  GetGroupStudentsValidator,
  GetGroupValidator,
  DeleteGroupValidator
} from "./validators/group.validator"
import {
  CreateRollValidator,
  UpdateRollValidator,
  GetRollValidator,
  DeleteRollValidator,
  CreateRollStateValidator,
  CreateRollStatesValidator,
  UpdateRollStateValidator
} from "./validators/roll.validator"
import { IRoute } from "./interface/misc.interface"

export const Routes: IRoute[] = [
  {
    method: "get",
    route: "/student/get-all",
    controller: StudentController,
    action: "allStudents",
  },
  {
    method: "get",
    route: "/student/:id",
    controller: StudentController,
    action: "getStudent",
    validator: GetStudentValidator()
  },
  {
    method: "post",
    route: "/student/create",
    controller: StudentController,
    action: "createStudent",
    validator: CreateStudentValidator()
  },
  {
    method: "put",
    route: "/student/update",
    controller: StudentController,
    action: "updateStudent",
    validator: UpdateStudentValidator()
  },
  {
    method: "delete",
    route: "/student/delete/:id",
    controller: StudentController,
    action: "removeStudent",
    validator: DeleteStudentValidator()
  },
  {
    method: "get",
    route: "/roll/get-all",
    controller: RollController,
    action: "allRolls",
  },
  {
    method: "get",
    route: "/roll/:id",
    controller: RollController,
    action: "getRoll",
    validator: GetRollValidator()
  },
  {
    method: "post",
    route: "/roll/create",
    controller: RollController,
    action: "createRoll",
    validator: CreateRollValidator()
  },
  {
    method: "put",
    route: "/roll/update",
    controller: RollController,
    action: "updateRoll",
    validator: UpdateRollValidator()
  },
  {
    method: "delete",
    route: "/roll/delete/:id",
    controller: RollController,
    action: "removeRoll",
    validator: DeleteRollValidator()
  },
  {
    method: "post",
    route: "/roll/add-student-states",
    controller: RollController,
    action: "addStudentRollStates",
    validator: CreateRollStatesValidator()
  },
  {
    method: "post",
    route: "/roll/add-student-roll-state",
    controller: RollController,
    action: "addStudentRollState",
    validator: CreateRollStateValidator()
  },
  {
    method: "put",
    route: "/roll/update-student-roll-state",
    controller: RollController,
    action: "updateStudentRollState",
    validator: UpdateRollStateValidator()
  },
  // group CRUD
  {
    method: "get",
    route: "/group/get-all",
    controller: GroupController,
    action: "allGroups",
  },
  {
    method: "post",
    route: "/group",
    controller: GroupController,
    action: "createGroup",
    validator: CreateGroupValidator()
  },
  {
    method: "put",
    route: "/group",
    controller: GroupController,
    action: "updateGroup",
    validator: UpdateGroupValidator()
  },
  {
    method: "delete",
    route: "/group/:id",
    controller: GroupController,
    action: "removeGroup",
    validator: DeleteGroupValidator(),
  },
  {
    method: "get",
    route: "/group/:id/students",
    controller: GroupController,
    action: "getGroupStudents",
    validator: GetGroupStudentsValidator()
  },
  {
    method: "get",
    route: "/group/run-filters",
    controller: GroupController,
    action: "runGroupFilters",
  },
]
