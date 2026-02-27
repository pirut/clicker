export function Footer() {
    return (
        <footer className="mt-auto w-full border-t border-border/70 bg-card/55 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-1.5 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:text-sm">
                <span className="font-medium tracking-wide">Built for fast clicks, loud leaderboards, and real-time bragging rights.</span>
                <span className="font-mono text-[11px] sm:text-xs">© {new Date().getFullYear()} JR Bussard</span>
            </div>
        </footer>
    );
}
