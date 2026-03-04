const Navbar = {
    template: `
        <nav class="px-6 py-4" style="background-color: var(--color-surface-dark); border-bottom: 1px solid var(--color-border-dark);">
            <div class="max-w-6xl mx-auto flex items-center gap-8">
                <h1 class="text-xl font-bold" style="color: var(--color-primary);">Social</h1>
                <div class="flex gap-2">
                    <button class="px-4 py-2 rounded-lg font-medium transition-colors" style="background-color: var(--color-primary); color: white;">
                        Home
                    </button>
                    <button class="px-4 py-2 rounded-lg font-medium transition-colors" style="color: #9ca3af;">
                        Discover
                    </button>
                    <button class="px-4 py-2 rounded-lg font-medium transition-colors" style="color: #9ca3af;">
                        Profile
                    </button>
                </div>
            </div>
        </nav>
    `,
};
