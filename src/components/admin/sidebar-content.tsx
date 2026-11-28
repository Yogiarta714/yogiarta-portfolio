import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { AdminNav } from "./admin-nav";

export function SidebarContent({ email }: { email: string }) {
    return (
        <div className="flex h-full flex-col gap-3">
            <div className="hidden px-3 md:block">
                <p className="font-heading text-xl leading-tight font-semibold">
                    Yogi Winata
                </p>
                <p className="text-muted-foreground font-mono text-xs">admin</p>
            </div>

            <div className="flex-1">
                <AdminNav />
            </div>

            <div className="border-sidebar-border space-y-2 border-t pt-3">
                <div className="flex items-center justify-between px-3">
                    <Link
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground text-sm"
                    >
                        Lihat situs ↗
                    </Link>
                    <ThemeToggle className="size-8" />
                </div>
                <p
                    className="text-muted-foreground truncate px-3 text-xs"
                    title={email}
                >
                    {email}
                </p>
                <form action={logoutAction}>
                    <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="w-full"
                    >
                        Keluar
                    </Button>
                </form>
            </div>
        </div>
    );
}
