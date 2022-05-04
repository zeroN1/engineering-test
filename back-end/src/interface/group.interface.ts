export const RollStates: Array<string> = ["unmark", "present", "absent", "late"]

export interface CreateGroupInput {
  name: string
  number_of_weeks: number
  roll_states: string
  incidents: number
  ltmt: "<" | ">"
}

export interface UpdateGroupInput extends CreateGroupInput {
  id: number
}
