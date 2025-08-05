import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code, Database, Globe, FileText, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
  showHeader?: boolean;
}

const languageIcons: Record<string, { icon: React.ComponentType<any>; label: string; color: string }> = {
  javascript: { icon: Code, label: 'JavaScript', color: 'text-yellow-400' },
  typescript: { icon: Code, label: 'TypeScript', color: 'text-blue-400' },
  jsx: { icon: Code, label: 'JavaScript (JSX)', color: 'text-cyan-400' },
  tsx: { icon: Code, label: 'TypeScript (JSX)', color: 'text-cyan-400' },
  python: { icon: Code, label: 'Python', color: 'text-green-400' },
  java: { icon: Code, label: 'Java', color: 'text-red-400' },
  html: { icon: Globe, label: 'HTML', color: 'text-orange-400' },
  css: { icon: FileText, label: 'CSS', color: 'text-blue-500' },
  php: { icon: Code, label: 'PHP', color: 'text-purple-400' },
  sql: { icon: Database, label: 'SQL', color: 'text-green-500' },
  mysql: { icon: Database, label: 'MySQL', color: 'text-blue-600' },
  bash: { icon: Terminal, label: 'Bash', color: 'text-gray-300' },
  shell: { icon: Terminal, label: 'Shell', color: 'text-gray-300' },
  json: { icon: FileText, label: 'JSON', color: 'text-yellow-500' },
  xml: { icon: FileText, label: 'XML', color: 'text-orange-500' },
  yaml: { icon: FileText, label: 'YAML', color: 'text-red-300' },
};

export function CodeBlock({ children, language = 'text', className, showHeader = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Código copiado para a área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar código",
        variant: "destructive",
      });
    }
  };

  const langInfo = languageIcons[language.toLowerCase()] || { icon: Code, label: language.toUpperCase(), color: 'text-gray-400' };
  const IconComponent = langInfo.icon;

  return (
    <div className={cn("relative rounded-lg border bg-muted overflow-hidden", className)}>
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b">
          <div className="flex items-center gap-2">
            <IconComponent className={cn("h-4 w-4", langInfo.color)} />
            <span className="text-sm font-medium text-gray-200">{langInfo.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2 text-gray-300 hover:text-white hover:bg-slate-700"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">
                {copied ? 'Copiado' : 'Copiar'}
              </span>
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            color: '#6b7280',
            paddingRight: '1rem',
            fontSize: '0.75rem',
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}