import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { PageLoading } from '@/components/ui/page-loading';

const AdminRoute = () => {
    const { user, isLoading, isInitializing } = useAuth();

    if (isLoading || isInitializing) {
        return <PageLoading message="Verifying admin access..." />;
    }

    // Check if user exists and has admin role
    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
