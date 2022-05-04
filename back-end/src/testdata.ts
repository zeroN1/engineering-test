import { EntityManager } from "typeorm"
import { GroupStudent } from "./entity/group-student.entity"
import { Group } from "./entity/group.entity"
import { Roll } from "./entity/roll.entity"
import { StudentRollState } from "./entity/student-roll-state.entity"
import { Student } from "./entity/student.entity"
import { CreateRollInput } from "./interface/roll.interface"

function* generateRollName() {
  const WeekStartDates = [
    new Date(2022, 3, 3, 15, 0, 0, 0),
    new Date(2022, 3, 10, 15, 0, 0, 0),
    new Date(2022, 3, 17, 15, 0, 0, 0),
    new Date(2022, 3, 24, 15, 0, 0, 0),
    new Date(2022, 4, 1, 15, 0, 0, 0)
  ]
  const WeekMax = 5
  const DayMax = 5

  for(let w = 1; w <= WeekMax; w++) {
    let wname = `Week${w}`
    let date = WeekStartDates[w-1]
    for(let d = 1; d <= DayMax; d++) {
      const name = wname + `Day${d}`
      if(d > 1) {
        date.setDate(date.getDate() + 1)
      }
      yield { date, name }
    }
  }
}

async function insertRollStates(manager: EntityManager) {
  const nameGen = generateRollName()
  while(true) {
    const pair = nameGen.next()
    if(!pair.value || pair.done) {
      break
    }
    const { date, name } = pair.value
    await manager.save(
      manager.create(Roll, {
        name: name,
        completed_at: date,
      } as CreateRollInput)
    )
  }
}

function createStudentWithAllStates() {
  
  const rolls = {}
  for(let roll = 1; roll <= 25; roll++) {
    const numAbsentees = Math.floor(Math.random() * 3 + 1)
    const numLate = Math.floor(Math.random() * 6 + 1)
    const absentees = []
    const late = []
    const others = []
  
    
    for(let i = 0; i < numAbsentees; ) {
      const std = Math.floor(Math.random() * 15 + 1)
      if(!absentees.includes(std)) {
        absentees.push(std)
        i++
      }
    }

    for(let i = 0; i < numLate; ) {
      const std = Math.floor(Math.random() * 15 + 1)
      if(!absentees.includes(std) && !late.includes(std)) {
        late.push(std)
        i++
      }
    }

    for(let std = 1; std <= 15; std++) {
      if(!absentees.includes(std) && !late.includes(std)) {
        others.push(std)
      }
    }

    rolls[roll] = { absentees, late, others }
  }
  return rolls
}

export async function insertSampleData(manager: EntityManager) {
  const addStudents = await manager.count(Student)
  const addRoll = await manager.count(Roll)
  const addRollStates = await manager.count(StudentRollState)
  const addGroups = await manager.count(Group)

  if (addStudents < 1) {
    // 1
    await manager.save(
      manager.create(Student, {
        first_name: "David",
        last_name: "Bowie",
        photo_url: "",
      })
    )
    // 2
    await manager.save(
      manager.create(Student, {
        first_name: "Robert",
        last_name: "Plant",
        photo_url: "",
      })
    )
    // 3
    await manager.save(
      manager.create(Student, {
        first_name: "James",
        last_name: "Bond",
        photo_url: "",
      })
    )
    // 4
    await manager.save(
      manager.create(Student, {
        first_name: "Bob",
        last_name: "Marley",
        photo_url: "",
      })
    )
    // 5
    await manager.save(
      manager.create(Student, {
        first_name: "Paul",
        last_name: "McCartney",
        photo_url: "",
      })
    )
    // 6
    await manager.save(
      manager.create(Student, {
        first_name: "George",
        last_name: "Harrison",
        photo_url: "",
      })
    )
    // 7
    await manager.save(
      manager.create(Student, {
        first_name: "Elton",
        last_name: "John",
        photo_url: "",
      })
    )
    // 8
    await manager.save(
      manager.create(Student, {
        first_name: "Simon",
        last_name: "Joyner",
        photo_url: "",
      })
    )
    // 9
    await manager.save(
      manager.create(Student, {
        first_name: "John",
        last_name: "Denver",
        photo_url: "",
      })
    )
    // 10
    await manager.save(
      manager.create(Student, {
        first_name: "Neil",
        last_name: "Diamond",
        photo_url: "",
      })
    )
    // 11
    await manager.save(
      manager.create(Student, {
        first_name: "Donna",
        last_name: "Summer",
        photo_url: "",
      })
    )
    // 12
    await manager.save(
      manager.create(Student, {
        first_name: "Aretha",
        last_name: "Franklin",
        photo_url: "",
      })
    )
    // 13
    await manager.save(
      manager.create(Student, {
        first_name: "Diana",
        last_name: "Ross",
        photo_url: "",
      })
    )
    // 14
    await manager.save(
      manager.create(Student, {
        first_name: "Kate",
        last_name: "Bush",
        photo_url: "",
      })
    )
    // 15
    await manager.save(
      manager.create(Student, {
        first_name: "Boz",
        last_name: "Scaggs",
        photo_url: "",
      })
    )
  } else {
    console.log(`Database have ${addStudents} students`)
  }

  if (addRoll < 1) {
    // create roll data
    await insertRollStates(manager)
  } else {
    console.log(`Database have ${addRoll} roll entries`)
  }

  if (addRollStates < 1) {
    const rolls = createStudentWithAllStates()
    for(const rollId of Object.keys(rolls)) {
      const { absentees, late, others } = rolls[rollId]
      
      for(const std of absentees) {
        await manager.save(
          manager.create(StudentRollState, {
            student_id: std,
            roll_id: parseInt(rollId),
            state: "absent"
          })
        )
      }

      for(const std of late) {
        await manager.save(
          manager.create(StudentRollState, {
            student_id: std,
            roll_id: parseInt(rollId),
            state: "late"
          })
        )
      }

      for(const std of others) {
        await manager.save(
          manager.create(StudentRollState, {
            student_id: std,
            roll_id: parseInt(rollId),
            state: "present"
          })
        )
      }

    }
    
  } else {
    console.log(`Datebase have ${addRollStates} roll-state entries`)
  }

  if (addGroups < 1) {
    // 1
    await manager.save(
      manager.create(Group, {
        name: "Absentee",
        number_of_weeks: 5,
        incidents: 1,
        roll_states: "absent",
        ltmt: ">",
        student_count: 0, // check to see if this updated later
      })
    )
    // 2
    await manager.save(
      manager.create(Group, {
        name: "Consistently Late",
        number_of_weeks: 5,
        incidents: 5,
        roll_states: "late",
        ltmt: ">",
        student_count: 0,
      })
    )
    // 3
    await manager.save(
      manager.create(Group, {
        name: "Half Attendance",
        number_of_weeks: 5,
        incidents: 12,
        roll_states: "present",
        ltmt: ">",
        student_count: 0,
      })
    )
    // 4
    await manager.save(
      manager.create(Group, {
        name: "Full Attendance",
        number_of_weeks: 5,
        incidents: 25,
        roll_states: "present",
        ltmt: ">",
        student_count: 0,
      })
    )
    // 5
    await manager.save(
      manager.create(Group, {
        name: "Recently Late",
        number_of_weeks: 2,
        incidents: 2,
        roll_states: "late",
        ltmt: ">",
        student_count: 0,
      })
    )
    // 6
    await manager.save(
      manager.create(Group, {
        name: "Recent 100% Attendance",
        number_of_weeks: 2,
        incidents: 10,
        roll_states: "present",
        ltmt: ">",
        student_count: 0,
      })
    )
    // 7
    await manager.save(
      manager.create(Group, {
        name: "Sometimes Late",
        number_of_weeks: 5,
        incidents: 3,
        roll_states: "late",
        ltmt: "<",
        student_count: 0,
      })
    )
  } else {
    console.log(`Database have ${addGroups} groups `)
  }
}
