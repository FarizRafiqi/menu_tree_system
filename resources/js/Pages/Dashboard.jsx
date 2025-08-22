import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout.jsx';

export default function Dashboard() {
    const { component } = usePage();
    return (
        <MainLayout>
            <Head title="Dashboard" />
            <h1>Dashboard</h1>
        </MainLayout>
    );
}
