import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { SqlDatabase } from 'langchain/sql_db';
import { createSqlAgent, SqlToolkit } from 'langchain/agents/toolkits/sql';
import { DataSource } from 'typeorm';

// Initialize the database connection
async function getDatabase() {
  const datasource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
  });

  await datasource.initialize();
  
  return SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Initialize the database
    const db = await getDatabase();

    // Initialize the LLM
    const llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Create SQL toolkit
    const toolkit = new SqlToolkit(db, llm);

    // Create the SQL agent with custom system prompt
    const executor = await createSqlAgent(llm, toolkit, {
      topK: 10,
      prefix: `You are an expert Medicare Advantage Analyst with deep knowledge of Medicare plans and CMS data.

You have access to the cms_landscape_2025 table with the following columns:
- id: Unique identifier
- contract_id: Contract ID (e.g., "H1234")
- plan_id: Plan ID (e.g., "001")
- org_name: Organization name (e.g., "Humana", "UnitedHealthcare", "Aetna")
- plan_name: Full plan name
- state: Two-letter state code (e.g., "IL", "FL")
- county: County name (e.g., "Cook", "Miami-Dade")
- monthly_premium: Monthly premium amount in dollars
- drug_deductible: Drug deductible amount in dollars
- star_rating: Star rating (1-5 scale)

IMPORTANT INSTRUCTIONS:
1. For questions about plans, costs, or ratings, ALWAYS query the database first
2. Return the final answer in a polite, professional summary
3. Do not expose internal database IDs unless specifically asked
4. When comparing plans, present the information in a clear, organized manner
5. If asked about the lowest premium, include the plan name and organization
6. Always verify your SQL queries are correct before executing them

Answer the user's question based on the data in the database.`,
    });

    // Execute the agent
    const result = await executor.invoke({
      input: message,
    });

    return NextResponse.json({
      response: result.output,
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process your request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
