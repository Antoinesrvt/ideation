import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TemplateConfig {
  moduleType: string
  name: string
  description: string
  version: number
}

const templates: TemplateConfig[] = [
  {
    moduleType: 'vision-problem',
    name: 'Vision & Problem Statement',
    description: 'A comprehensive template for defining the problem and vision',
    version: 1
  },
  {
    moduleType: 'market-analysis',
    name: 'Market Analysis Report',
    description: 'Detailed market analysis template with competitive landscape',
    version: 1
  },
  {
    moduleType: 'business-model',
    name: 'Business Model Canvas',
    description: 'Business model analysis using the canvas framework',
    version: 1
  },
  {
    moduleType: 'financial-projections',
    name: 'Financial Projections',
    description: 'Detailed financial forecasts and analysis template',
    version: 1
  },
  {
    moduleType: 'go-to-market',
    name: 'Go-to-Market Strategy',
    description: 'Comprehensive go-to-market strategy and execution plan',
    version: 1
  },
  {
    moduleType: 'implementation-timeline',
    name: 'Implementation Timeline',
    description: 'Detailed project implementation and timeline planning',
    version: 1
  },
  {
    moduleType: 'pitch-deck',
    name: 'Pitch Deck',
    description: 'Professional investor pitch deck template',
    version: 1
  },
  {
    moduleType: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Comprehensive risk assessment and mitigation strategies',
    version: 1
  }
]

async function uploadTemplate(template: TemplateConfig) {
  try {
    const templatePath = join(process.cwd(), 'templates', template.moduleType, `v${template.version}`, 'template.md')
    const content = readFileSync(templatePath, 'utf-8')
    
    // Upload to storage
    const storagePath = `${template.moduleType}/v${template.version}/template.md`
    const { error: uploadError } = await supabase.storage
      .from('templates')
      .upload(storagePath, content, {
        contentType: 'text/markdown',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Create template record
    const { error: dbError } = await supabase
      .from('document_templates')
      .insert({
        module_type: template.moduleType,
        name: template.name,
        description: template.description,
        template_path: storagePath,
        version: template.version,
        tags: [template.moduleType],
        metadata: {
          lastUpdated: new Date().toISOString(),
          format: 'markdown'
        }
      })

    if (dbError) throw dbError

    console.log(`✅ Successfully uploaded template: ${template.name}`)
  } catch (error) {
    console.error(`❌ Error uploading template ${template.name}:`, error)
  }
}

async function main() {
  console.log('🚀 Starting template upload...')
  
  for (const template of templates) {
    await uploadTemplate(template)
  }
  
  console.log('✨ Template upload complete!')
}

main()
  .catch(console.error)
  .finally(() => process.exit()) 