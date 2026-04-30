/**
 * API Route: POST /api/ai/analyze
 * Autonomous IA analysis endpoints for leads and properties
 */

import { NextRequest, NextResponse } from "next/server";
import {
  analyzeLeadAndRecommendProperties,
  qualifyLead,
  processNaturalLanguageQuery,
  generateInvestmentAnalysis,
} from "@/lib/ai/claudeAPI";
import { verifyAuth } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = await verifyAuth(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { action, payload } = await request.json();

    switch (action) {
      case "qualify-lead":
        const leadAnalysis = await qualifyLead(payload.leadData);
        return NextResponse.json(leadAnalysis);

      case "recommend-properties":
        const recommendations = await analyzeLeadAndRecommendProperties(
          payload.leadProfile,
          payload.properties
        );
        return NextResponse.json({ recommendations });

      case "query":
        const queryResponse = await processNaturalLanguageQuery(
          payload.query,
          {
            userId: decoded.sub,
            role: decoded.role,
            recentData: payload.context,
          }
        );
        return NextResponse.json(queryResponse);

      case "investment-analysis":
        const analysis = await generateInvestmentAnalysis(payload.property);
        return NextResponse.json({ analysis });

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
