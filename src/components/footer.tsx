export function Footer() {
    return (
        <footer className="mt-auto border-t border-border/40 py-4">
            <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-1 px-4 text-xs text-foreground/50 sm:flex-row sm:items-center">
                <span className="font-medium tracking-wide">Built for clicks, leaderboards, and bragging rights.</span>
                <span className="font-mono text-[11px]">© {new Date().getFullYear()} JR Bussard</span>
            </div>
        </footer>
    );
}
