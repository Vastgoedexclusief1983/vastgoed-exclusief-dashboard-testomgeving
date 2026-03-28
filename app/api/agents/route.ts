import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { requireAdmin } from '@/lib/auth/session';
import { createAgentSchema } from '@/lib/validations/agent';
import { hashPassword, generateRandomPassword } from '@/lib/utils/password';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const agents = await User.find({ role: 'agent' })
      .select('-password')
      .sort({ createdAt: -1 });

    return successResponse(agents);
  } catch (error: any) {
    return errorResponse(error.message, 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const validatedData = createAgentSchema.parse(body);

    const existingUser = await User.findOne({
      $or: [{ email: validatedData.email }, { agentCode: validatedData.agentCode }],
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return errorResponse('Email already exists', 400);
      }
      if (existingUser.agentCode === validatedData.agentCode) {
        return errorResponse('Agent code already exists', 400);
      }
    }

    const password = validatedData.password || generateRandomPassword();
    const hashedPassword = await hashPassword(password);

    const agent = await User.create({
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      companyName: validatedData.companyName,
      agentCode: validatedData.agentCode,
      role: 'agent',
      isActive: true,
    });

    const { password: _, ...agentResponse } = agent.toObject();

    return successResponse(
      {
        agent: agentResponse,
        generatedPassword: validatedData.password ? undefined : password,
      },
      201
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return errorResponse(error.message, 401);
  }
}
