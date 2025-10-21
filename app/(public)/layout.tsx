export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex flex-col">
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div className="flex items-center">
							<img
								src="/financbase-logo-32.png"
								alt="Financbase Logo"
								className="h-8 w-8"
							/>
							<span className="ml-2 text-xl font-bold text-gray-900">Financbase</span>
						</div>
						<nav className="hidden md:flex space-x-8">
							<a href="/" className="text-gray-500 hover:text-gray-900">Home</a>
							<a href="/about" className="text-gray-500 hover:text-gray-900">About</a>
							<a href="/pricing" className="text-gray-500 hover:text-gray-900">Pricing</a>
							<a href="/contact" className="text-gray-500 hover:text-gray-900">Contact</a>
						</nav>
					</div>
				</div>
			</header>
			<main className="flex-1">{children}</main>
			<footer className="bg-gray-50">
				<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<p className="text-gray-500">&copy; 2024 Financbase. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
