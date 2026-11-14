import { MobileNav } from "./mobile-nav";
import { SidebarContent } from "./sidebar-content";

export function AdminFrame({
    email,
    children,
}: {
    email: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-screen self-start overflow-y-auto border-r p-4 md:block">
                <SidebarContent email={email} />
            </aside>

            <div className="flex min-w-0 flex-col">
                <MobileNav>
                    <SidebarContent email={email} />
                </MobileNav>
                <main className="flex-1 p-4 md:p-8">{children}</main>
            </div>
        </div>
    );
}
