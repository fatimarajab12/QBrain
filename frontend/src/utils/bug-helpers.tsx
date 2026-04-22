import React from "react";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

export const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'bg-red-600 text-white border-red-700';
    case 'high': return 'bg-orange-500 text-white border-orange-600';
    case 'medium': return 'bg-yellow-500 text-white border-yellow-600';
    case 'low': return 'bg-blue-500 text-white border-blue-600';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'p0': return 'bg-red-700 text-white border-red-800';
    case 'p1': return 'bg-red-500 text-white border-red-600';
    case 'p2': return 'bg-orange-500 text-white border-orange-600';
    case 'p3': return 'bg-blue-500 text-white border-blue-600';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'open': return 'bg-red-500 text-white border-red-600';
    case 'in progress': return 'bg-cyan-500 text-white border-cyan-600';
    case 'resolved': return 'bg-green-500 text-white border-green-600';
    case 'closed': return 'bg-gray-500 text-white border-gray-600';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const getStatusIcon = (status: string): React.ReactElement => {
  switch (status.toLowerCase()) {
    case 'open': return <AlertCircle className="h-4 w-4" />;
    case 'in progress': return <Clock className="h-4 w-4" />;
    case 'resolved': return <CheckCircle className="h-4 w-4" />;
    case 'closed': return <XCircle className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
};

export const getReproducibilityLabel = (reproducibility: string): string => {
  switch (reproducibility.toLowerCase()) {
    case 'always': return 'Always';
    case 'often': return 'Often';
    case 'sometimes': return 'Sometimes';
    case 'rare': return 'Rare';
    case 'unable': return 'Unable to reproduce';
    default: return reproducibility;
  }
};

export const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

