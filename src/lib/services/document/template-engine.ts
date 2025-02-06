import Handlebars from 'handlebars';
import { marked } from 'marked';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, convertInchesToTwip } from 'docx';
import type { Browser } from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';


// Define types for Handlebars helpers
interface HelperOptions extends Handlebars.HelperOptions {
  fn: (context?: any) => string;
  inverse: (context?: any) => string;
  hash: any;
  data: any;
}

// Define types for marked tokens
interface MarkedToken {
  type: string;
  text?: string;
  depth?: number;
  items?: Array<{ text: string }>;
}

// Register custom helpers
Handlebars.registerHelper('formatDate', function(this: any, date: string) {
  return new Date(date).toLocaleDateString();
});

Handlebars.registerHelper('ifEquals', function(this: any, arg1: any, arg2: any, options: HelperOptions) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('markdown', function(this: any, text: string) {
  if (typeof text !== 'string') return '';
  const parsed = marked.parse(text);
  return new Handlebars.SafeString(typeof parsed === 'string' ? parsed : '');
});

// Load and register partials
const PARTIALS_DIR = join(process.cwd(), 'templates', 'partials');
try {
  const commonHeader = readFileSync(join(PARTIALS_DIR, 'header.md'), 'utf-8');
  const commonFooter = readFileSync(join(PARTIALS_DIR, 'footer.md'), 'utf-8');
  
  Handlebars.registerPartial('header', commonHeader);
  Handlebars.registerPartial('footer', commonFooter);
} catch (error) {
  console.warn('Warning: Could not load template partials:', error);
}

export class TemplateEngine {
  private cache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private browser: Browser | null = null;

  /**
   * Process a template with the given data
   */
  async processTemplate(template: string, data: Record<string, any>): Promise<string> {
    try {
      let compiledTemplate = this.cache.get(template);
      
      if (!compiledTemplate) {
        compiledTemplate = Handlebars.compile(template, { 
          strict: true,
          noEscape: false,
          preventIndent: true,
          knownHelpersOnly: false
        });
        this.cache.set(template, compiledTemplate);
      }

      return compiledTemplate(data);
    } catch (error) {
      console.error('Error processing template:', error);
      throw new Error('Failed to process template');
    }
  }

  /**
   * Convert markdown content to PDF using Puppeteer
   */
  async convertToPDF(markdown: string): Promise<Buffer> {
    try {
      // Convert markdown to HTML
      const parsed = marked.parse(markdown, {
        gfm: true,
        breaks: true
      });
      const html = typeof parsed === 'string' ? parsed : '';

      // Create HTML document with styles
      const document = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
              }
              h1, h2, h3 { margin-top: 2rem; }
              p { margin: 1rem 0; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; }
              th { background-color: #f5f5f5; }
              @page { margin: 2cm; }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `;

      // Initialize browser if needed
      if (!this.browser) {
        // Dynamic import puppeteer to avoid server-side issues
        const puppeteer = await import('puppeteer');
        this.browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      }

      // Create new page and set content
      const page = await this.browser.newPage();
      await page.setContent(document, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: false,
        margin: {
          top: '2cm',
          bottom: '2cm',
          left: '2cm',
          right: '2cm'
        }
      });

      await page.close();
      return Buffer.from(pdf);
    } catch (error) {
      console.error('Error converting to PDF:', error);
      throw new Error('Failed to convert to PDF');
    }
  }

  /**
   * Convert markdown content to DOCX
   */
  async convertToDocx(markdown: string): Promise<Buffer> {
    try {
      const tokens = marked.lexer(markdown) as MarkedToken[];
      const sections: Paragraph[] = [];
      let currentSection: Paragraph[] = [];

      for (const token of tokens) {
        switch (token.type) {
          case 'heading':
            if (currentSection.length > 0) {
              sections.push(...currentSection);
              currentSection = [];
            }
            if (token.text && typeof token.depth === 'number') {
              currentSection.push(new Paragraph({
                text: token.text,
                heading: this.getHeadingLevel(token.depth),
                spacing: { before: convertInchesToTwip(0.2), after: convertInchesToTwip(0.1) }
              }));
            }
            break;

          case 'paragraph':
            if (token.text) {
              currentSection.push(new Paragraph({
                children: [new TextRun({ text: token.text })],
                spacing: { before: convertInchesToTwip(0.1), after: convertInchesToTwip(0.1) }
              }));
            }
            break;

          case 'list':
            if (token.items) {
              for (const item of token.items) {
                currentSection.push(new Paragraph({
                  children: [new TextRun({ text: `• ${item.text}` })],
                  spacing: { before: convertInchesToTwip(0.1), after: 0 }
                }));
              }
            }
            break;

          // Add more token types as needed
        }
      }

      if (currentSection.length > 0) {
        sections.push(...currentSection);
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: sections
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Error converting to DOCX:', error);
      throw new Error('Failed to convert to DOCX');
    }
  }

  private getHeadingLevel(depth: number): typeof HeadingLevel[keyof typeof HeadingLevel] {
    switch (depth) {
      case 1: return HeadingLevel.HEADING_1;
      case 2: return HeadingLevel.HEADING_2;
      case 3: return HeadingLevel.HEADING_3;
      case 4: return HeadingLevel.HEADING_4;
      case 5: return HeadingLevel.HEADING_5;
      default: return HeadingLevel.HEADING_6;
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 