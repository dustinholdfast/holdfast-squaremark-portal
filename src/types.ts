export type EvidenceStatus = "Received" | "Partial" | "Missing" | "N/A"
export type MilestoneStatus = "Upcoming" | "In progress" | "Complete" | "Blocked"
export type InterviewStatus = "Proposed" | "Scheduled" | "Complete" | "Canceled"

export type Phase = {
  id: string
  label: string
}

export type Milestone = {
  id: string
  title: string
  description: string
  target: string
  status: MilestoneStatus
}

export type EvidenceRow = {
  id: string
  system: string
  item: string
  status: EvidenceStatus
  notes: string
}

export type Interview = {
  id: string
  title: string
  withWhom: string
  status: InterviewStatus
  when: string
  notes: string
}

export type ClientUpdate = {
  text: string
  postedAt: string
}

export type Engagement = {
  client: string
  lead: string
  ao: string
  assessorNote: string
  scope: string
  weekLabel: string
  phases: Phase[]
  milestones: Milestone[]
  evidence: EvidenceRow[]
  interviews: Interview[]
  clientUpdate: ClientUpdate | null
  updatedAt: string
}
