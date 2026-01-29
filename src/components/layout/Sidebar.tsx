export default function Sidebar() {
    const menuItems = [
        { name: "Dashboard", href: "#" },
        { name: "Receipts", href: "#" },
        { name: "Subscriptions", href: "#" },
        { name: "Warranties", href: "#" },
    ];

    return (
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white min-h-screen p-4">
            <div className="mb-8 px-4 text-xl font-bold text-gray-800">
                LifeLedger
            </div>
            <nav className="space-y-1">
                {menuItems.map((item) => (
                    <a
                        key={item.name}
                        href={item.href}
                        className="group flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                        {item.name}
                    </a>
                ))}
            </nav>
        </aside>
    );
}
