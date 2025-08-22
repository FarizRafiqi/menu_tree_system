import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo.jsx';
import { Icon } from '@iconify/react';
import { usePage } from '@inertiajs/react';

const menus = [
    {
        sectionClass: 'bg-[#045FC8] rounded-[24px] px-2 py-4',
        items: [
            { label: 'Systems', icon: 'material-symbols:folder-rounded', href: '#' },
            { label: 'System Code', icon: 'material-symbols:grid-view-outline-rounded', href: '#' },
            { label: 'Properties', icon: 'material-symbols:grid-view-outline-rounded', href: '#' },
            { label: 'Menus', icon: 'material-symbols:grid-view-outline-rounded', route: '/menus' },
            { label: 'API List', icon: 'material-symbols:grid-view-outline-rounded', href: '#' }
        ]
    },
    {
        sectionClass: 'px-2 py-4',
        items: [
            { label: 'Users & Group', icon: 'material-symbols:folder-outline-rounded', href: '#' },
            { label: 'Competition', icon: 'material-symbols:folder-outline-rounded', href: '#' }
        ]
    }
];

// helper: render item Link/anchor + active state
function NavItem({ item, isActive, collapsed }) {
    const base =
        'flex items-center py-2 px-2 rounded-[16px] font-semibold transition hover:bg-white hover:text-black';
    const active = isActive ? 'bg-white text-black' : '';
    const Cmp = item.route ? Link : 'a';
    const props = item.route ? { href: item.route } : { href: item.href || '#' };

    return (
        <Cmp {...props} className={`${base} ${active}`}>
            <Icon icon={item.icon} width="20" height="20" className="mr-4" />
            {!collapsed && <span>{item.label}</span>}
        </Cmp>
    );
}

const MainLayout = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { component, url } = usePage();
    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    const isActive = (item) => {
        const target = item.route ?? item.href ?? '#';
        if (target === '#') return false;
        // simple startsWith match
        return url?.startsWith(target);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div
                className={`bg-blue-800 text-white flex flex-col transition-all duration-300 py-4 my-4 ml-4 rounded-[24px] ${
                    isSidebarCollapsed ? 'w-16' : 'w-64'
                }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 rounded-xl">
                    {!isSidebarCollapsed ? <ApplicationLogo className="block h-8 ps-4 w-auto fill-current" /> : null}

                    <button onClick={toggleSidebar}>
                        {isSidebarCollapsed ? (
                            <Icon icon="material-symbols:menu-rounded" width="24" height="24" />
                        ) : (
                            <Icon icon="material-symbols:menu-open-rounded" width="24" height="24" />
                        )}
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-5 py-4">
                    {menus.map((section, si) => (
                        <div key={si} className={section.sectionClass}>
                            <ul className="space-y-1">
                                {section.items.map((item, ii) => (
                                    <li key={ii}>
                                        <NavItem item={item} isActive={isActive(item)} collapsed={isSidebarCollapsed} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto my-4">
                {/* Header */}
                <header className="bg-white">
                    <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <nav aria-label="breadcrumb">
                                <ol className="flex list-none p-0">
                                    <li>
                                        <a href="#" className="text-blue-500">
                                            <Icon icon="material-symbols:folder-rounded" width="24" height="24"
                                                  className="text-gray-300" />
                                        </a>
                                    </li>
                                    <li>
                                        <span className="mx-2 text-gray-400">/</span>
                                    </li>
                                    <li>{component}</li>
                                </ol>
                            </nav>
                            {/*<input/>*/}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main>
                    <div className="mx-auto max-w-7xl pt-4 px-4 sm:px-6 lg:px-8">
                        <nav aria-label="breadcrumb">
                            <ol className="flex items-center list-none p-0">
                                <li className="mr-4">
                                    <a href="#" className="text-blue-500">
                                        <img src="img/icon-title.svg" alt="Icon Title"/>
                                    </a>
                                </li>
                                <li>
                                    <span className="text-2xl font-semibold">{component}</span>
                                </li>
                            </ol>
                        </nav>
                    </div>
                    <div className="mx-auto max-w-7xl py-4 sm:px-6 lg:px-8">
                        <div className="py-4 sm:rounded-lg bg-white">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
