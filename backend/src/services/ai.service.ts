import OpenAI from 'openai';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface RFPRequirements {
  title: string;
  description?: string;
  requirements: Array<{
    item: string;
    quantity?: number;
    specifications?: string;
  }>;
  budget?: number;
  deadline?: string;
  paymentTerms?: string;
  warranty?: string;
  deliveryTerms?: string;
}

interface ProposalData {
  pricing: {
    total?: number;
    items?: Array<{
      item: string;
      quantity?: number;
      unitPrice?: number;
      total?: number;
    }>;
  };
  terms: {
    payment?: string;
    warranty?: string;
    delivery?: string;
  };
  compliance: {
    meetsRequirements: boolean;
    missingItems?: string[];
    additionalOffers?: string[];
  };
  notes?: string;
}

interface ComparisonResult {
  proposals: Array<{
    vendorId: string;
    vendorName: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    summary: string;
  }>;
  recommendation: {
    vendorId: string;
    vendorName: string;
    reasoning: string;
  };
}

export class AIService {
  /**
   * Extract structured RFP from natural language input
   */
  async extractRFPFromText(userInput: string): Promise<RFPRequirements> {
    try {
      const prompt = `You are an expert at extracting procurement requirements from natural language.

Extract structured RFP information from the following user input. Return ONLY valid JSON matching this schema:
{
  "title": "string (concise title)",
  "description": "string (optional detailed description)",
  "requirements": [
    {
      "item": "string (item name)",
      "quantity": "number (optional)",
      "specifications": "string (optional specs like RAM, size, etc.)"
    }
  ],
  "budget": "number (optional, in USD)",
  "deadline": "string (optional, ISO date or relative like '30 days')",
  "paymentTerms": "string (optional, e.g. 'net 30')",
  "warranty": "string (optional)",
  "deliveryTerms": "string (optional)"
}

User input: "${userInput}"

Return ONLY the JSON object, no additional text or markdown formatting.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a procurement expert. Extract structured data and return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse JSON response
      const extracted = JSON.parse(content);
      
      // Validate and normalize
      return {
        title: extracted.title || 'Untitled RFP',
        description: extracted.description,
        requirements: Array.isArray(extracted.requirements) 
          ? extracted.requirements 
          : [],
        budget: extracted.budget ? parseFloat(extracted.budget) : undefined,
        deadline: extracted.deadline,
        paymentTerms: extracted.paymentTerms,
        warranty: extracted.warranty,
        deliveryTerms: extracted.deliveryTerms
      };
    } catch (error) {
      logger.error('Error extracting RFP from text:', error);
      throw new Error(`Failed to extract RFP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse vendor proposal from email content and attachments
   */
  async parseProposal(
    emailBody: string,
    attachmentsText?: string[],
    rfpRequirements?: any
  ): Promise<ProposalData> {
    try {
      const combinedText = [
        emailBody,
        ...(attachmentsText || [])
      ].join('\n\n---\n\n');

      const prompt = `You are an expert at extracting structured proposal data from vendor responses.

Extract proposal information from the following vendor response. Return ONLY valid JSON matching this schema:
{
  "pricing": {
    "total": "number (total price in USD, optional)",
    "items": [
      {
        "item": "string",
        "quantity": "number (optional)",
        "unitPrice": "number (optional)",
        "total": "number (optional)"
      }
    ]
  },
  "terms": {
    "payment": "string (payment terms)",
    "warranty": "string (warranty terms)",
    "delivery": "string (delivery terms)"
  },
  "compliance": {
    "meetsRequirements": "boolean",
    "missingItems": "array of strings (items not addressed)",
    "additionalOffers": "array of strings (extra items/services offered)"
  },
  "notes": "string (optional additional notes)"
}

Vendor response:
${combinedText}

${rfpRequirements ? `\nOriginal RFP Requirements:\n${JSON.stringify(rfpRequirements, null, 2)}` : ''}

Return ONLY the JSON object, no additional text or markdown formatting.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a procurement analyst. Extract structured proposal data and return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      return JSON.parse(content);
    } catch (error) {
      logger.error('Error parsing proposal:', error);
      throw new Error(`Failed to parse proposal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Compare proposals and provide recommendation
   */
  async compareProposals(
    rfpRequirements: any,
    proposals: Array<{
      vendorId: string;
      vendorName: string;
      proposalData: ProposalData;
    }>
  ): Promise<ComparisonResult> {
    try {
      const prompt = `You are an expert procurement analyst. Compare multiple vendor proposals and provide a recommendation.

RFP Requirements:
${JSON.stringify(rfpRequirements, null, 2)}

Proposals:
${JSON.stringify(proposals.map(p => ({
  vendor: p.vendorName,
  data: p.proposalData
})), null, 2)}

Analyze each proposal and return ONLY valid JSON matching this schema:
{
  "proposals": [
    {
      "vendorId": "string",
      "vendorName": "string",
      "score": "number (0-100, overall score)",
      "strengths": ["array of strengths"],
      "weaknesses": ["array of weaknesses"],
      "summary": "string (brief summary)"
    }
  ],
  "recommendation": {
    "vendorId": "string",
    "vendorName": "string",
    "reasoning": "string (detailed explanation of why this vendor is recommended)"
  }
}

Consider: pricing competitiveness, compliance with requirements, terms (payment, warranty, delivery), and overall value.

Return ONLY the JSON object, no additional text or markdown formatting.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a procurement expert. Provide detailed comparison and recommendation. Return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      return JSON.parse(content);
    } catch (error) {
      logger.error('Error comparing proposals:', error);
      throw new Error(`Failed to compare proposals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const aiService = new AIService();

