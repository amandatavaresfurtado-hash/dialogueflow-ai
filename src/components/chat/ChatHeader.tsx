import { SidebarTrigger } from '@/components/ui/sidebar';

export function ChatHeader() {
  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">ChatGPT Clone</h1>
        </div>
      </div>
    </header>
  );
}