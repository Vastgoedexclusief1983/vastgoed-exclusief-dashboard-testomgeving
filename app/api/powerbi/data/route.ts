import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Property from '@/lib/db/models/Property';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all agents
    const agents = await User.find({ role: 'agent' })
      .select('-password')
      .lean();

    // Get all properties
    const properties = await Property.find().lean();

    // Create a map of properties by agent
    const propertiesByAgent = new Map();
    properties.forEach((property: any) => {
      const agentId = property.agentId.toString();
      if (!propertiesByAgent.has(agentId)) {
        propertiesByAgent.set(agentId, []);
      }
      propertiesByAgent.get(agentId).push(property);
    });

    // Format data for Power BI
    const powerBIData = {
      metadata: {
        totalAgents: agents.length,
        totalProperties: properties.length,
        lastUpdated: new Date().toISOString(),
        refreshInterval: '30 minutes',
      },
      agents: agents.map((agent: any) => {
        const agentProperties = propertiesByAgent.get(agent._id.toString()) || [];
        const totalValue = agentProperties.reduce((sum: number, p: any) => sum + (p.basicInfo?.basePrice || 0), 0);
        const avgValue = agentProperties.length > 0 ? totalValue / agentProperties.length : 0;

        // Get unique cities
        const cities = [...new Set(agentProperties.map((p: any) => p.basicInfo?.city).filter(Boolean))];

        // Get property types distribution
        const propertyTypes: { [key: string]: number } = {};
        agentProperties.forEach((p: any) => {
          const type = p.basicInfo?.propertyType || 'Unknown';
          propertyTypes[type] = (propertyTypes[type] || 0) + 1;
        });

        return {
          agentId: agent._id.toString(),
          agentCode: agent.agentCode || '',
          firstName: agent.firstName,
          lastName: agent.lastName,
          fullName: `${agent.firstName} ${agent.lastName}`,
          email: agent.email,
          isActive: agent.isActive,
          joinDate: agent.createdAt,
          lastLogin: agent.lastLogin || null,
          totalProperties: agentProperties.length,
          portfolioValue: totalValue,
          averagePropertyValue: avgValue,
          citiesCount: cities.length,
          cities: cities,
          propertyTypes: propertyTypes,
        };
      }),
      properties: properties.map((property: any) => {
        // Find the agent for this property
        const agent = agents.find((a: any) => a._id.toString() === property.agentId.toString());

        return {
          propertyId: property._id.toString(),
          agentId: property.agentId.toString(),
          agentName: agent ? `${agent.firstName} ${agent.lastName}` : 'Unknown',
          agentCode: agent?.agentCode || '',
          address: property.basicInfo?.address || '',
          postalCode: property.basicInfo?.postalCode || '',
          city: property.basicInfo?.city || '',
          province: property.basicInfo?.province || '',
          propertyType: property.basicInfo?.propertyType || '',
          constructionYear: property.basicInfo?.constructionYear || null,
          basePrice: property.basicInfo?.basePrice || 0,
          energyLabel: property.basicInfo?.energyLabel || '',
          location: property.basicInfo?.location || '',
          livingArea: property.dimensions?.livingArea || 0,
          lotSize: property.dimensions?.lotSize || 0,
          bedrooms: property.dimensions?.bedrooms || 0,
          bathrooms: property.dimensions?.bathrooms || 0,
          hasParking: property.luxuryFeatures?.parking?.available || false,
          parkingSpaces: property.luxuryFeatures?.parking?.spaces || 0,
          parkingType: property.luxuryFeatures?.parking?.type || '',
          amenities: property.luxuryFeatures?.amenities || [],
          createdDate: property.createdAt,
          updatedDate: property.updatedAt,
        };
      }),
      summary: {
        totalAgents: agents.length,
        activeAgents: agents.filter((a: any) => a.isActive).length,
        inactiveAgents: agents.filter((a: any) => !a.isActive).length,
        totalProperties: properties.length,
        totalPortfolioValue: properties.reduce((sum: number, p: any) => sum + (p.basicInfo?.basePrice || 0), 0),
        averagePropertiesPerAgent: agents.length > 0 ? properties.length / agents.length : 0,
        propertyTypeDistribution: properties.reduce((acc: any, p: any) => {
          const type = p.basicInfo?.propertyType || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        cityDistribution: properties.reduce((acc: any, p: any) => {
          const city = p.basicInfo?.city || 'Unknown';
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        }, {}),
      },
    };

    return NextResponse.json(powerBIData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Power BI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', message: error.message },
      { status: 500 }
    );
  }
}
