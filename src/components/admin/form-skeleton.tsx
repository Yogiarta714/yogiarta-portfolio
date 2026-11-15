export function FormSkeleton({ sections = 3 }: { sections?: number }) {
    return (
        <div className="space-y-6" role="status" aria-label="Memuat">
            {Array.from({ length: sections }, (_, i) => (
                <div
                    key={i}
                    className="bg-card border-border/60 h-56 animate-pulse rounded-2xl border"
                />
            ))}
        </div>
    );
}
