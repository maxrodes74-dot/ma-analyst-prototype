# MA-Analyst: Medicare Advantage Analyst

An AI-powered RAG (Retrieval-Augmented Generation) agent that translates natural language questions into SQL queries against a Medicare Advantage plan database.

## 🚀 Features

- **Natural Language Queries**: Ask questions in plain English about Medicare plans
- **LangChain SQL Agent**: Automatically translates queries to SQL using GPT-4o
- **Real-time Analysis**: Instant responses with data from Supabase PostgreSQL
- **Clean UI**: Medical/enterprise-themed interface with Tailwind CSS
- **Stripe Integration**: Ready for subscription-based monetization
- **Railway Deployment**: One-click deployment configuration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React
- **Database**: Supabase (PostgreSQL)
- **AI Logic**: LangChain.js + OpenAI GPT-4o
- **Payments**: Stripe (Subscription gating)
- **Deployment**: Railway (Node.js service)

## 📊 Database Schema

The `cms_landscape_2025` table contains:

- `id`: Unique identifier (BigInt, Primary Key)
- `contract_id`: Contract ID (Text, e.g., "H1234")
- `plan_id`: Plan ID (Text, e.g., "001")
- `org_name`: Organization name (Text)
- `plan_name`: Full plan name (Text)
- `state`: Two-letter state code (Text)
- `county`: County name (Text)
- `monthly_premium`: Monthly premium in dollars (Numeric)
- `drug_deductible`: Drug deductible in dollars (Numeric)
- `star_rating`: Star rating 1-5 (Numeric)

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- OpenAI API key
- Stripe account (optional, for monetization)

### Environment Variables

Create a `.env` file based on `.env.example`:

\`\`\`bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Database Configuration
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
\`\`\`

### Installation

\`\`\`bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📝 Example Queries

Try asking:

- "Which plan in Cook County has the lowest premium?"
- "Show me all Humana plans"
- "What are the highest rated plans in Florida?"
- "Compare drug deductibles for plans in Miami-Dade"

## 💾 Adding Real CMS Data

The prototype currently uses 5 mock records. To add real CMS data:

### Option 1: Manual CSV Import

1. Download the CMS Medicare Advantage Landscape file (CSV format)
2. Connect to your Supabase database
3. Use Supabase's CSV import feature or pgAdmin
4. Map CSV columns to the table schema

### Option 2: Programmatic Import

\`\`\`sql
-- Example: Import from CSV file
COPY cms_landscape_2025(contract_id, plan_id, org_name, plan_name, state, county, monthly_premium, drug_deductible, star_rating)
FROM '/path/to/cms_data.csv'
DELIMITER ','
CSV HEADER;
\`\`\`

### Option 3: Using Supabase Client

\`\`\`typescript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const results: any[] = [];

fs.createReadStream('cms_data.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    const { error } = await supabase
      .from('cms_landscape_2025')
      .insert(results);
    
    if (error) console.error('Error:', error);
    else console.log('Data imported successfully!');
  });
\`\`\`

## 🚀 Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Railway will automatically detect `railway.json` and deploy

### Vercel (Alternative)

\`\`\`bash
pnpm add -g vercel
vercel
\`\`\`

## 💳 Stripe Monetization

The project includes a Stripe product "Analyst Pro" ($29/month):

- Product ID: `prod_TW4P3e3FYBoGzx`
- Price ID: `price_1SZ2HBEywgG0Hl8kd9bVw5W7`

To enable subscription gating:

1. Uncomment the middleware logic in `middleware.ts`
2. Implement Stripe Checkout flow
3. Set `is_pro` cookie after successful subscription

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📧 Support

For questions or issues, please open a GitHub issue.
