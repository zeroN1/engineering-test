import { getRepository, getConnection, EntityManager } from "typeorm"
import { Group } from "../entity/group.entity"
import { GroupStudent } from "../entity/group-student.entity"
import { NextFunction, Request, Response } from "express"
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface"
import { map } from "lodash"
import { Student } from "../entity/student.entity"
import { StudentRollState } from "../entity/student-roll-state.entity"

export class GroupController {
  private groupRepository = getRepository(Group)
  private groupStudentRepository = getRepository(GroupStudent)
  private studentRollStateRepository = getRepository(StudentRollState)

  async allGroups(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    return this.groupRepository.find()
    // Return the list of all groups
  }

  async createGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Add a Group
    const { body } = request
    const createGroupInput: CreateGroupInput = {
      name: body.name,
      number_of_weeks: body.number_of_weeks,
      incidents: body.incidents,
      ltmt: body.ltmt,
      roll_states: body.roll_states,
    }

    const group = new Group()
    group.prepareToCreate(createGroupInput)
    await this.groupRepository.save(group)
  }

  async updateGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Update a Group
    const { body: params } = request
    return this.groupRepository
      .findOne(params.id)
      .then((group) => {
        const updateGroupInput: UpdateGroupInput = {
          id: params.id, // ? is it needed
          name: params.name,
          number_of_weeks: params.number_of_weeks,
          roll_states: params.roll_states,
          incidents: params.incidents,
          ltmt: params.incidents,
        }

        group.prepareToUpdate(updateGroupInput)
        return this.groupRepository.save(group)
      })
  }

  async removeGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Delete a Group
    const group = await this.groupRepository.findOne(request.params.id)
    return this.groupRepository.remove(group)
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Return the list of Students that are in a Group
    const groupId = request.params.id
    return getConnection().manager.createQueryBuilder()
      .select("std.id, std.first_name, std.last_name, std.first_name || ' ' || std.last_name as full_name")
      .from(Student, "std")
      .leftJoin("group_student", "gs", "std.id = gs.student_id")
      .where("gs.group_id = :groupId", { groupId })
      .execute()  
  }

  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    // Task 2:
    // 1. Clear out the groups (delete all the students from the groups)
    // 2. For each group, query the student rolls to see which students match the filter for the group
    // 3. Add the list of students that match the filter to the group
    return getConnection().transaction(async (manager) => {
      await manager.getRepository(GroupStudent).clear()
      const groups = await manager.getRepository(Group).find()
      await Promise.all(groups.map(group => this.populateGroupStudents(manager, group)))

      return { status: 200, message: "All filters executed" }
    })
  }

  private async populateGroupStudents(manager: EntityManager, group: Group) {
    const { incidents, number_of_weeks, roll_states, ltmt } = group

    // define the time for filter
    // time starts at current datetime - (7 * number_of_weeks)
    // time ends at current datetime
    // this gives the entire range of time for which this group
    // is defined
    const dateRangeStart = `datetime('now', '${-7*number_of_weeks} day')`
    const dateRangeEnd = "datetime('now')"
    const q = manager
      .createQueryBuilder()
      .select(
        "srs.student_id, count(srs.state) as incidents"
      )
      .from(StudentRollState, "srs")
      .leftJoin("student", "std", "std.id = srs.student_id")
      .leftJoin("roll", "r", "r.id = srs.roll_id")
      .where("srs.state = :roll_states", { roll_states })
      .andWhere(`r.completed_at >= ${dateRangeStart}`)
      .andWhere(`r.completed_at <= ${dateRangeEnd}`)
      .groupBy("srs.student_id")
      .having(`incidents ${ltmt} :num_incidents`, { num_incidents: incidents })
      
    console.log(q.getQueryAndParameters(  ))
    const students = await q.execute()
    
    
    console.log("Groups")
    console.log(students)
    group.student_count = students.length
    group.run_at = new Date(Date.now())
    await manager.save(group)

    // map each students to group student relation
    await manager.insert(GroupStudent, map(students, (std: any) => {
      return {
        student_id: std.student_id,
        group_id: group.id,
        incident_count: std.incidents
      }
    }))
  }
}
