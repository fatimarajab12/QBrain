import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import AdminRoute from "@/components/AdminRoute";

const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ProjectDetails = lazy(() => import("@/pages/ProjectDetails"));
const FeatureDetails = lazy(() => import("@/pages/FeatureDetails"));
const BugDetails = lazy(() => import("@/pages/BugDetails"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const TestCasesPage = lazy(() => import("@/pages/project-details/TestCasesPage"));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/projects/:projectId",
        element: <ProjectDetails />,
      },
      {
        path: "/projects/:projectId/bugs/:bugId",
        element: <BugDetails />,
      },
      {
        path: "/projects/:projectId/features/:featureId",
        element: <FeatureDetails />,
      },
      {
        path: "/projects/:projectId/test-cases",
        element: <TestCasesPage />,
      },
      {
        path: "/projects/:projectId/chat",
        element: <ChatPage />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: "/admin",
            element: <AdminDashboard />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

