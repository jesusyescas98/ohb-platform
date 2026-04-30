/**
 * FASE D - Claude API Integration
 * Autonomous IA Agent for OHB Platform
 *
 * Features:
 * - Prompt caching for efficient token usage
 * - Real-time property recommendations
 * - Lead analysis and qualification
 * - Natural language query processing
 * - Session management with TTL
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Type definitions for IA responses
export interface IAPropertyRecommendation {
  propertyId: string;
  matchScore: number; // 0-100
  reason: string;
  potentialROI?: number;
  riskLevel: "low" | "medium" | "high";
}

export interface IALeadAnalysis {
  leadId: string;
  qualification: "hot" | "warm" | "cold";
  suggestedNextStep: string;
  estimatedCloseTime: "1-week" | "1-month" | "3-months" | "6-months";
  recommendedServices: string[];
}

export interface IAQueryResponse {
  answer: string;
  suggestedActions: string[];
  confidenceScore: number;
}

/**
 * System prompt with caching - reused across requests
 * Reduces token cost for repeated agent calls
 */
const SYSTEM_PROMPT = `You are AVA, an autonomous IA assistant for OHB Asesorías y Consultorías.
You are an expert in:
- Real estate valuation and investment analysis
- Lead qualification and sales pipeline management
- Property market analysis in Ciudad Juárez
- ROI calculations and financial projections
- Customer service and communication

Context about OHB:
- Location: Ciudad Juárez, Chihuahua, Mexico
- Services: Real estate sales/rentals, investment properties, legal consulting
- WhatsApp: +526561327685
- Email: support@ohb.com
- Target clients: Investors, property buyers/sellers, renters

You respond in SPANISH (es-MX) by default unless asked otherwise.
Always be professional, helpful, and focused on driving sales and lead qualification.
Provide specific, actionable recommendations.
Use JSON format when requested.`;

/**
 * Generate property recommendations based on lead profile
 */
export async function analyzeLeadAndRecommendProperties(
  leadProfile: {
    budget: number;
    propertyType: string;
    location: string;
    investmentGoal?: string;
    riskTolerance?: string;
  },
  availableProperties: any[]
): Promise<IAPropertyRecommendation[]> {
  const prompt = `
Analyze this lead profile and recommend the best matching properties from our inventory:

Lead Profile:
- Budget: $${leadProfile.budget.toLocaleString()} MXN
- Property Type: ${leadProfile.propertyType}
- Preferred Location: ${leadProfile.location}
- Investment Goal: ${leadProfile.investmentGoal || "Not specified"}
- Risk Tolerance: ${leadProfile.riskTolerance || "Medium"}

Available Properties:
${JSON.stringify(availableProperties, null, 2)}

Return a JSON array of top 3 recommendations with this structure:
[{
  "propertyId": "string",
  "matchScore": number (0-100),
  "reason": "string",
  "potentialROI": number (if investment property),
  "riskLevel": "low|medium|high"
}]

Be specific and consider: budget fit, location preference, market trends in Juárez.
`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  try {
    const content = response.content[0];
    if (content.type === "text") {
      // Extract JSON from response
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error("Error parsing IA response:", error);
  }

  return [];
}

/**
 * Analyze lead for qualification and next steps
 */
export async function qualifyLead(leadData: {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyInterest?: string;
  budget?: number;
  source: string;
}): Promise<IALeadAnalysis> {
  const prompt = `
Analyze this lead and provide qualification assessment:

Lead Information:
${JSON.stringify(leadData, null, 2)}

Provide a JSON response with:
{
  "leadId": "auto-generated",
  "qualification": "hot|warm|cold",
  "suggestedNextStep": "specific action (es-MX)",
  "estimatedCloseTime": "1-week|1-month|3-months|6-months",
  "recommendedServices": ["service1", "service2"]
}

Consider: budget size, communication clarity, urgency signals, property match, timeline.
Hot = ready to buy in 1-4 weeks
Warm = interested, needs nurturing, 1-3 months
Cold = exploratory, may take 6+ months
`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  try {
    const content = response.content[0];
    if (content.type === "text") {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error("Error parsing lead qualification:", error);
  }

  return {
    leadId: Math.random().toString(36).substr(2, 9),
    qualification: "warm",
    suggestedNextStep: "Follow up vía WhatsApp con propuesta personalizada",
    estimatedCloseTime: "1-month",
    recommendedServices: ["inmobiliaria"],
  };
}

/**
 * Natural language query processing for dashboard
 */
export async function processNaturalLanguageQuery(
  query: string,
  context?: {
    userId: string;
    role: "admin" | "asesor" | "cliente";
    recentData?: any;
  }
): Promise<IAQueryResponse> {
  const contextStr = context
    ? `
User Context:
- Role: ${context.role}
- User ID: ${context.userId}
- Recent Data: ${JSON.stringify(context.recentData || {})}
`
    : "";

  const prompt = `
User Query: "${query}"
${contextStr}

Provide helpful response in JSON format:
{
  "answer": "direct answer (es-MX)",
  "suggestedActions": ["action1", "action2"],
  "confidenceScore": number (0-1)
}

Focus on OHB business context. If query is about sales, leads, properties, or investments, provide specific data-driven recommendations.
`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  try {
    const content = response.content[0];
    if (content.type === "text") {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error("Error processing query:", error);
  }

  return {
    answer:
      "No pude procesar tu pregunta. Por favor intenta de otra forma o contacta a soporte.",
    suggestedActions: ["Contactar a soporte", "Intentar otra pregunta"],
    confidenceScore: 0,
  };
}

/**
 * Generate investment analysis report
 */
export async function generateInvestmentAnalysis(property: {
  id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  rentalIncome?: number;
  maintenanceCosts?: number;
}): Promise<string> {
  const prompt = `
Generate a professional investment analysis report for this property (format: plain text, es-MX):

Property:
${JSON.stringify(property, null, 2)}

Include:
1. Resumen ejecutivo (50 palabras)
2. Análisis de mercado en Ciudad Juárez
3. Proyección de ROI (3, 5, 10 años)
4. Riesgos potenciales
5. Comparativa con propiedades similares
6. Recomendación final (Comprar/Esperar/No recomendado)

Usa datos realistas del mercado inmobiliario de Juárez 2026.
`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  return content.type === "text" ? content.text : "Error generating report";
}
