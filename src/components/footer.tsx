export function Footer() {
    return (
        <footer className="mt-auto border-t-2 border-dashed border-border/60 py-5">
            <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-1.5 px-4 text-xs text-foreground/50 sm:flex-row sm:items-center">
                <span className="font-display font-medium tracking-wide">Built for clicks, leaderboards, and bragging rights.</span>
                <span className="font-mono text-[11px]">&copy; {new Date().getFullYear()} JR Bussard</span>
            </div>
        </footer>
    );
}
