import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { requireAdmin } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (agentId) {
      const agent = await User.findOne({ _id: agentId, role: 'agent' }).select('-password');

      if (!agent) {
        return errorResponse('Agent not found', 404);
      }

      const stats = {
        totalProperties: 0,
        registrationDate: agent.createdAt,
        lastLogin: agent.lastLogin,
        isActive: agent.isActive,
      };

      return successResponse({ agent, stats });
    }

    const totalAgents = await User.countDocuments({ role: 'agent' });
    const activeAgents = await User.countDocuments({ role: 'agent', isActive: true });
    const totalProperties = 0;

    return successResponse({
      totalAgents,
      activeAgents,
      totalProperties,
    });
  } catch (error: any) {
    return errorResponse(error.message, 401);
  }
}
