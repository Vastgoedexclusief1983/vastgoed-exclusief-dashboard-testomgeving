import { z } from 'zod';

export const createAgentSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
  agentCode: z.string().min(1, 'Agent code is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export const updateAgentSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  companyName: z.string().optional(),
  agentCode: z.string().min(1, 'Agent code is required').optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
