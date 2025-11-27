import { GoogleGenAI, Type } from "@google/genai";
import { RaceEngineerResponse, GameMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRaceEngineerComment = async (
  reactionTime: number, 
  mode: GameMode, 
  roundIndex: number, 
  totalRounds: number | null
): Promise<RaceEngineerResponse> => {
  try {
    const isSprint = mode === GameMode.SPRINT;
    const isEndurance = mode === GameMode.ENDURANCE;
    const isFinalRound = totalRounds && roundIndex === totalRounds;

    const contextPrompt = `
      GAME MODE: ${mode}
      ROUND: ${roundIndex} / ${totalRounds || 'Infinite'}
      REACTION TIME: ${reactionTime}ms

      SCENARIO CONTEXT:
      ${isSprint ? "This is a Sprint Qualifying session. Every millisecond counts for grid position." : ""}
      ${isEndurance ? "This is a long Grand Prix stint. Consistency and tire management (focus) is key." : ""}
      ${isFinalRound ? "This is the FINAL LAP/ATTEMPT. Did they bring it home?" : ""}

      PERFORMANCE TIERS:
      - < 200ms: Alien/Verstappen level (Ecstatic)
      - 200-250ms: Podium contender (Happy)
      - 250-350ms: Midfield/Points finish (Neutral)
      - > 350ms: Backmarker/Blue Flags (Sarcastic)
      - > 600ms: Latifi/Mazepin moment (Angry/Funny)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
      ${contextPrompt}

      PERSONA:
      Act as a chaotic, meme-loving Formula 1 Race Engineer.
      Mix of: Gianpiero Lambiase (dry/sarcastic), Bono (hype), and Gunther Steiner (brutal honesty).
      
      MANDATORY:
      - Use F1 slang: "Box box", "Hammer time", "Smooth operator", "No Mikey", "Simply lovely", "We are checking", "Inchident", "Penalty".
      - Be short and punchy (max 1-2 sentences).
      - If it's a Sprint or Endurance, mention the 'tires' or 'fuel' metaphorically relating to their brain/reaction speed.
      
      OUTPUT JSON ONLY.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            comment: { type: Type.STRING },
            mood: { 
              type: Type.STRING, 
              enum: ['happy', 'angry', 'neutral', 'sarcastic'] 
            }
          },
          required: ['comment', 'mood']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as RaceEngineerResponse;
  } catch (error) {
    console.error("Error fetching AI comment:", error);
    return {
      comment: "Radio check. Telemetry is offline, driver default 0-1.",
      mood: "neutral"
    };
  }
};