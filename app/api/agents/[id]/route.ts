import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { requireAdmin } from '@/lib/auth/session';
import { updateAgentSchema } from '@/lib/validations/agent';
import { hashPassword } from '@/lib/utils/password';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const agent = await User.findOne({ _id: id, role: 'agent' }).select('-password');

    if (!agent) {
      return notFoundResponse('Agent not found');
    }

    return successResponse(agent);
  } catch (error: any) {
    return errorResponse(error.message, 401);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateAgentSchema.parse(body);

    const agent = await User.findOne({ _id: id, role: 'agent' });

    if (!agent) {
      return notFoundResponse('Agent not found');
    }

    if (validatedData.email && validatedData.email !== agent.email) {
      const existingEmail = await User.findOne({ email: validatedData.email });
      if (existingEmail) {
        return errorResponse('Email already exists', 400);
      }
    }

    if (validatedData.agentCode && validatedData.agentCode !== agent.agentCode) {
      const existingCode = await User.findOne({ agentCode: validatedData.agentCode });
      if (existingCode) {
        return errorResponse('Agent code already exists', 400);
      }
    }

    if (validatedData.password) {
      validatedData.password = await hashPassword(validatedData.password);
    }

    Object.assign(agent, validatedData);
    await agent.save();

    const { password, ...agentResponse } = agent.toObject();

    return successResponse(agentResponse);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return errorResponse(error.message, 401);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const agent = await User.findOneAndDelete({ _id: id, role: 'agent' });

    if (!agent) {
      return notFoundResponse('Agent not found');
    }

    return successResponse({ message: 'Agent deleted successfully' });
  } catch (error: any) {
    return errorResponse(error.message, 401);
  }
}
