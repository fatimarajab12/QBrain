import { Eye, Download, File, Image as ImageIcon, FileText, Video, Archive, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AttachmentDetail {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
}

interface BugAttachmentsProps {
  attachments: string[];
  attachmentDetails?: AttachmentDetail[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (mimetype: string) => {
  if (mimetype.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5 text-blue-500" />;
  } else if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) {
    return <FileText className="h-5 w-5 text-red-500" />;
  } else if (mimetype.includes('video')) {
    return <Video className="h-5 w-5 text-purple-500" />;
  } else if (mimetype.includes('spreadsheet') || mimetype.includes('excel') || mimetype.includes('csv')) {
    return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  } else if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z')) {
    return <Archive className="h-5 w-5 text-orange-500" />;
  } else {
    return <File className="h-5 w-5 text-gray-500" />;
  }
};

const getFileUrl = (path: string): string => {
  // If path starts with http, return as is
  if (path.startsWith('http')) {
    return path;
  }
  // Otherwise, construct full URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL.replace('/api', '')}${cleanPath}`;
};

export const BugAttachments = ({ attachments, attachmentDetails }: BugAttachmentsProps) => {
  // Use attachmentDetails if available, otherwise fall back to attachments array
  const hasAttachments = (attachmentDetails && attachmentDetails.length > 0) || (attachments && attachments.length > 0);
  
  if (!hasAttachments) return null;

  // If we have detailed attachment info, use it; otherwise use simple paths
  const displayAttachments = attachmentDetails && attachmentDetails.length > 0
    ? attachmentDetails
    : attachments.map(path => ({
        filename: path.split('/').pop() || path,
        originalname: path.split('/').pop() || path,
        path: path,
        size: 0,
        mimetype: 'application/octet-stream',
      }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Attachments ({displayAttachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {displayAttachments.map((attachment, index) => {
            const fileUrl = getFileUrl(attachment.path);
            const isImage = attachment.mimetype.startsWith('image/');
            
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getFileIcon(attachment.mimetype)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={attachment.originalname}>
                    {attachment.originalname || attachment.filename}
                  </p>
                  {attachment.size > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(attachment.size)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isImage ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open(fileUrl, '_blank')}
                      title="View image"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = fileUrl;
                      link.download = attachment.originalname || attachment.filename;
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
