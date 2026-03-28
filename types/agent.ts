export interface IAgent {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  agentCode: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface SerializedAgent {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  agentCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AgentStats {
  totalProperties: number;
  registrationDate: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface AgentWithStats extends IAgent {
  stats: AgentStats;
}

export interface CreateAgentInput {
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  agentCode: string;
  password?: string;
}

export interface UpdateAgentInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  agentCode?: string;
  isActive?: boolean;
  password?: string;
}
