import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { AdminNav } from "./admin-nav";

export function SidebarContent({ email }: { email: string }) {
    return (
        <div className="flex h-full flex-col gap-6">
            <div className="hidden px-3 pt-1 md:block">
                <p className="font-heading text-xl font-semibold">yogiarta</p>
                <p className="text-muted-foreground font-mono text-xs">admin</p>
            </div>

            <div className="flex-1">
                <AdminNav />
            </div>

            <div className="border-sidebar-border space-y-3 border-t pt-4">
                <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground block px-3 text-sm"
                >
                    Lihat situs ↗
                </Link>
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
