import { CodeBlock } from '@/components/ui/code-block';

interface CodeRendererProps {
  code: string;
  language?: string;
}

export function CodeRenderer({ code, language }: CodeRendererProps) {
  // Detecta a linguagem automaticamente se não foi especificada
  const detectLanguage = (codeContent: string): string => {
    const content = codeContent.toLowerCase().trim();
    
    // PHP
    if (content.includes('<?php') || content.includes('echo') || content.includes('$')) {
      return 'php';
    }
    
    // HTML
    if (content.includes('<!doctype') || content.includes('<html') || content.includes('<body')) {
      return 'html';
    }
    
    // CSS
    if (content.includes('{') && content.includes('}') && (content.includes(':') || content.includes('px') || content.includes('rem'))) {
      return 'css';
    }
    
    // JavaScript/TypeScript
    if (content.includes('console.log') || content.includes('function') || content.includes('const ') || content.includes('let ') || content.includes('var ')) {
      if (content.includes('interface ') || content.includes(': string') || content.includes(': number')) {
        return 'typescript';
      }
      return 'javascript';
    }
    
    // Python
    if (content.includes('print(') || content.includes('def ') || content.includes('import ') || content.includes('from ')) {
      return 'python';
    }
    
    // SQL
    if (content.includes('select ') || content.includes('insert ') || content.includes('update ') || content.includes('delete ') || content.includes('create table')) {
      return 'sql';
    }
    
    // JSON
    if ((content.startsWith('{') && content.endsWith('}')) || (content.startsWith('[') && content.endsWith(']'))) {
      try {
        JSON.parse(codeContent);
        return 'json';
      } catch {
        // Not valid JSON
      }
    }
    
    // XML
    if (content.includes('<?xml') || (content.includes('<') && content.includes('>'))) {
      return 'xml';
    }
    
    return language || 'text';
  };

  const detectedLanguage = detectLanguage(code);

  return (
    <div className="my-4">
      <CodeBlock language={detectedLanguage}>
        {code}
      </CodeBlock>
    </div>
  );
}