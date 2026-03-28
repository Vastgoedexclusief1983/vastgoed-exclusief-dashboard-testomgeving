import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Property from '@/lib/db/models/Property';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    const agents = await User.find({ role: 'agent' }).select('-password').lean();
    const properties = await Property.find().lean();

    const propertiesByAgent = new Map();
    properties.forEach((property: any) => {
      const agentId = property.agentId.toString();
      if (!propertiesByAgent.has(agentId)) {
        propertiesByAgent.set(agentId, []);
      }
      propertiesByAgent.get(agentId).push(property);
    });

    const agentsData = agents.map((agent: any) => {
      const agentProperties = propertiesByAgent.get(agent._id.toString()) || [];
      const totalValue = agentProperties.reduce((sum: number, p: any) => sum + (p.basicInfo?.basePrice || 0), 0);
      const cities = [...new Set(agentProperties.map((p: any) => p.basicInfo?.city).filter(Boolean))];

      return {
        AgentID: agent._id.toString(),
        AgentCode: agent.agentCode || '',
        FirstName: agent.firstName,
        LastName: agent.lastName,
        FullName: `${agent.firstName} ${agent.lastName}`,
        Email: agent.email,
        IsActive: agent.isActive,
        JoinDate: agent.createdAt,
        LastLogin: agent.lastLogin || null,
        TotalProperties: agentProperties.length,
        PortfolioValue: totalValue,
        AveragePropertyValue: agentProperties.length > 0 ? totalValue / agentProperties.length : 0,
        CitiesCount: cities.length,
      };
    });

    return NextResponse.json(agentsData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch agents data', message: error.message },
      { status: 500 }
    );
  }
}
