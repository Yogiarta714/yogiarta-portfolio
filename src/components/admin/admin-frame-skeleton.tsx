import { Skeleton } from "@/components/ui/skeleton";

export function AdminFrameSkeleton() {
    return (
        <div className="min-h-screen md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="bg-sidebar border-sidebar-border hidden space-y-3 border-r p-4 md:block">
                <Skeleton className="h-6 w-24" />
                {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                ))}
            </aside>
            <div className="space-y-4 p-4 md:p-8">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full max-w-xl" />
            </div>
        </div>
    );
}
