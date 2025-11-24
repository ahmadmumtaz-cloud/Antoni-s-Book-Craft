import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BookStructure, GenerationParams } from "../types";

export const generateBookContent = async (params: GenerationParams): Promise<BookStructure> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Calculate dynamic constraints based on user input
  const estimatedChapters = Math.max(3, Math.ceil(params.pageCount / 4)); 
  // Assumption: approx 4 pages per chapter for AI generation balance.
  // If user asks for 100 pages -> approx 25 chapters.
  // If user asks for 5 pages -> 3 chapters minimum.
  
  const wordCountPerSection = params.pageCount > 30 ? "800-1000" : "500-700";

  // Schema definition for the Book Structure to ensure JSON reliability
  const bookSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: `The academic title of the Fiqh book in ${params.language}` },
      subtitle: { type: Type.STRING, description: `A descriptive subtitle in ${params.language}` },
      author: { type: Type.STRING, description: "Name of the author" },
      abstract: { type: Type.STRING, description: `A detailed executive summary or abstract of the book (approx 300 words) in ${params.language}` },
      language: { type: Type.STRING, description: "The language code or name used for the content (e.g. 'Indonesia', 'Arabic', 'English')" },
      chapters: {
        type: Type.ARRAY,
        description: `List of chapters in the book. You MUST generate approx ${estimatedChapters} chapters to match the requested book length.`,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: `Chapter title in ${params.language}` },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: `Section title (e.g., Definition, Dalil, Scholarly Views) in ${params.language}` },
                  content: { type: Type.STRING, description: `The content of the section in ${params.language}. Target length: ${wordCountPerSection} words. MUST include In-text citations for every claim (e.g., (Al-Nawawi, Al-Majmu, 2/45)).` }
                },
                required: ["title", "content"]
              }
            }
          },
          required: ["title", "sections"]
        }
      },
      references: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: `A comprehensive bibliography listing exactly ${params.referenceCount} credible classical and contemporary sources.`
      }
    },
    required: ["title", "subtitle", "author", "chapters", "references", "language"]
  };

  const systemInstruction = `
    You are 'Antoni's Book Craft', a world-class AI editor for Islamic Jurisprudence (Fiqh).
    Your goal is to author HIGH-QUALITY academic Fiqh books that are ready for publication.
    
    Adhere to these standards:
    1. **Language**: You MUST write the entire book in **${params.language}**.
    2. **Volume**: The user has requested a book of approximately ${params.pageCount} pages. You must adjust your detail level to meet this.
    3. **Structure**: Follow strict academic structure (Definition -> Basis/Dalil -> Rulings -> Application/Fatwa -> Conclusion).
    4. **Credibility**: Cite valid sources (Qur'an with Surah/Verse, Hadith with narrator, Classical Kitabs).
    5. **Citations**: You MUST use In-note / In-text citations format within the content text. Example: "Imam Al-Nawawi stated that... (Al-Majmu', 1/123)".
    6. **References**: You MUST generate a bibliography list of ${params.referenceCount} distinct items.
    7. **Formatting**: Output pure JSON matching the provided schema.
  `;

  const prompt = `
    Create a comprehensive, publication-ready Fiqh book manuscript on the topic: "${params.topic}".
    Author Name: ${params.authorName}.
    Focus Madzhab: ${params.madzhab}.
    Target Audience: ${params.targetAudience}.
    Output Language: ${params.language}.
    
    **CRITICAL QUANTITY REQUIREMENTS:**
    1. **Target Length**: The user explicitly requested a ${params.pageCount}-page book. 
       - If the count is high (>40), generate many chapters (${estimatedChapters}+) with very deep, extensive detailed text.
       - If the count is low (<10), be concise but professional.
    2. **References**: Provide exactly ${params.referenceCount} unique references in the bibliography.
    
    **CONTENT REQUIREMENTS:**
    1. **Detail**: Each section must be detailed, explaining the 'Why' and 'How'.
    2. **Evidence**: Include exhaustive Dalil (Quranic verses, Hadith text/translation, Usul Fiqh maxims).
    3. **In-Notes**: Every Fiqh ruling must have a source citation in brackets immediately following the statement.
    4. **Chapters**: Include "Contemporary Issues" and "Comparative Perspectives" where applicable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: bookSchema,
        temperature: 0.3,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from AI");

    const bookData: BookStructure = JSON.parse(text);
    // Fallback if AI forgets to set language field
    if (!bookData.language) bookData.language = params.language;
    return bookData;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};