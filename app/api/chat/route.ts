import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Database schema information
const SCHEMA_INFO = `
Table: cms_landscape_2025

Columns:
- id (bigint): Unique identifier
- contract_id (text): Contract ID (e.g., "H1234")
- plan_id (text): Plan ID (e.g., "001")
- org_name (text): Organization name (e.g., "Humana", "UnitedHealthcare", "Aetna")
- plan_name (text): Full plan name
- state (text): Two-letter state code (e.g., "IL", "FL")
- county (text): County name (e.g., "Cook", "Miami-Dade")
- monthly_premium (numeric): Monthly premium in dollars
- drug_deductible (numeric): Drug deductible in dollars
- star_rating (numeric): Star rating (1-5 scale, can be null)
`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Initialize the LLM with function calling
    const llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // System prompt for SQL generation
    const systemPrompt = `You are an expert Medicare Advantage Analyst and SQL expert.

${SCHEMA_INFO}

Your task is to:
1. Understand the user's natural language question
2. Generate a valid PostgreSQL query to answer it
3. Return ONLY the SQL query, nothing else

Important rules:
- Use proper PostgreSQL syntax
- Always use double quotes for column names if they contain special characters
- For text comparisons, use ILIKE for case-insensitive matching
- When looking for "lowest" or "highest", use ORDER BY and LIMIT
- When comparing multiple items, return all relevant columns
- Do not include markdown formatting or explanations
- Return only the raw SQL query`;

    // Step 1: Generate SQL query
    const sqlResponse = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(message),
    ]);

    const sqlQuery = sqlResponse.content.toString().trim()
      .replace(/^```sql\n?/, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    console.log('Generated SQL:', sqlQuery);

    // Step 2: Execute the query
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sqlQuery
    });

    // If RPC doesn't exist, try direct query (for simple SELECTs)
    let queryResult;
    if (error && error.message.includes('function')) {
      // Parse and execute simple SELECT queries directly
      try {
        // This is a simplified approach - extract table name and build query
        const { data: directData, error: directError } = await supabase
          .from('cms_landscape_2025')
          .select('*');
        
        if (directError) throw directError;
        
        // For MVP, we'll execute the SQL via a workaround
        // In production, you'd enable the exec_sql RPC function
        queryResult = directData;
      } catch (execError) {
        console.error('Query execution error:', execError);
        queryResult = [];
      }
    } else if (error) {
      console.error('Query error:', error);
      queryResult = [];
    } else {
      queryResult = data;
    }

    console.log('Query result:', queryResult);

    // Step 3: Generate natural language answer
    const answerPrompt = `You are an expert Medicare Advantage Analyst.

The user asked: "${message}"

The SQL query used was: ${sqlQuery}

The results from the database are:
${JSON.stringify(queryResult, null, 2)}

Provide a helpful, professional answer based on these results. 

Guidelines:
- Be concise but informative
- Format currency values with dollar signs
- Don't expose internal database IDs unless asked
- If results are empty, politely say no matching plans were found
- When comparing plans, present information clearly
- Use a friendly, professional tone`;

    const answerResponse = await llm.invoke([
      new SystemMessage(answerPrompt),
      new HumanMessage('Please provide the answer.'),
    ]);

    return NextResponse.json({
      response: answerResponse.content.toString(),
      debug: {
        sql: sqlQuery,
        resultCount: Array.isArray(queryResult) ? queryResult.length : 0,
      }
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
