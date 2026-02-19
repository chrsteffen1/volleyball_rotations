import { SidebarTrigger } from '@/components/ui/sidebar';

const VolleyballIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 0-4.47 18.06" />
      <path d="M12 22a10 10 0 0 1 4.47-18.06" />
      <path d="M2 12a10 10 0 0 1 18.06 4.47" />
      <path d="M21.94 12a10 10 0 0 0-18.06-4.47" />
    </svg>
)

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
       <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <VolleyballIcon className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold tracking-wide">VolleyRotations</h1>
      </div>
    </header>
  );
}
