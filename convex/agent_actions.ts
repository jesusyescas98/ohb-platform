import { v } from "convex/values";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

export const chat = action({
  args: {
    sessionId: v.string(),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 1. Guardar mensaje usuario
    await ctx.runMutation(api.agent.saveMessage, {
      sessionId: args.sessionId,
      role: "user",
      text: args.message,
    });

    // 2. Obtener historial y contexto
    const history = await ctx.runQuery(api.agent.getHistory, {
      sessionId: args.sessionId,
    });

    // Inventario simplificado para el prompt
    const inventory = await ctx.runQuery(api.properties.list, {});
    const inventoryContext = inventory.slice(0, 5).map(p => 
      `- ${p.name} en ${p.address}, Precio: $${p.price.toLocaleString()} MXN.`
    ).join("\n");

    try {
      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });

      const result = await generateText({
        model: openrouter("google/gemini-2.0-flash-001"),
        system: `Eres el Asesor Virtual Inteligente de OHB Asesorías y Consultorías.
        
        INVENTARIO DISPONIBLE:
        ${inventoryContext}

        INSTRUCCIONES:
        - Sé profesional, conciso y orienta al usuario hacia la inversión o compra.
        - Si detectas: Nombre, Presupuesto, Ubicación o Interés, menciónalo al final en una sola línea así:
          [DATA: N=Nombre | P=Presupuesto | L=Ubicacion | I=Interes | S=Score 1-5]
        `,
        messages: history.map((m) => ({ role: m.role as "user" | "assistant", content: m.text })),
      });
  
      let responseText = result.text;
      
      // Procesar extracción de datos simple
      const dataMatch = responseText.match(/\[DATA: (.*?)\]/);
      if (dataMatch) {
        const parts = dataMatch[1].split(' | ');
        const extracted: any = {};
        parts.forEach(p => {
          const [k, v] = p.split('=');
          if (v && v !== '...') extracted[k] = v;
        });

        await ctx.runMutation(api.setup.updateProfile, {
          sessionId: args.sessionId,
          name: extracted.N,
          budget: extracted.P ? parseInt(extracted.P.replace(/[^0-9]/g, '')) : undefined,
          interest: extracted.I,
          location: extracted.L,
          score: extracted.S ? parseInt(extracted.S) : undefined,
        });
        
        responseText = responseText.replace(/\[DATA: .*?\]/, '').trim();
      }
      
      await ctx.runMutation(api.agent.saveMessage, {
        sessionId: args.sessionId,
        role: "assistant",
        text: responseText || "Entendido. ¿En qué más puedo apoyarte?",
      });
    } catch (error) {
      console.error("AI Error:", error);
      await ctx.runMutation(api.agent.saveMessage, {
        sessionId: args.sessionId,
        role: "assistant",
        text: "Hola, soy el asistente de OHB. ¿Buscas invertir en propiedades en México?",
      });
    }

    return null;
  },
});
