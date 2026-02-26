export function Footer() {
    return (
        <footer className="w-full mt-auto border-t border-border/50 backdrop-blur-sm bg-background/70">
            <div className="max-w-7xl mx-auto px-4 py-3 text-xs sm:text-sm text-muted-foreground flex items-center justify-between gap-3">
                <span>Built for fast clicks and clean competition.</span>
                <span>© {new Date().getFullYear()} JR Bussard</span>
            </div>
        </footer>
    );
}
