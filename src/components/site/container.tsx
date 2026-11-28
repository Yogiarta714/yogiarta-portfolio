import { cn } from "@/lib/utils";

export function Container({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "mx-auto w-full max-w-340 px-[clamp(20px,4.5vw,64px)]",
                className,
            )}
            {...props}
        />
    );
}
