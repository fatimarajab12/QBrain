export interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export interface ProjectChatBotProps {
  projectId: string;
  projectName?: string;
}

export interface ChatApiResponse {
  success: boolean;
  data?: {
    answer: string;
  };
  message?: string;
}


