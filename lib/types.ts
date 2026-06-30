export interface Club {
  id: number;
  name: string;
  category: string;
  icon: string;
  description: string;
  member_count: number;
}

export interface Member {
  id: number;
  name: string;
  student_id: string;
  year: number;
  room: string;
  email: string;
  avatar: string;
}

export interface AdvocacyReq {
  id: number;
  student_id: string;
  request_type: string;
  title: string;
  description: string;
  status: string;
  admin_response: string | null;
  resolved_by: string | null;
  revocation_reason: string | null;
  created_at: string;
}

export interface Session {
  student_id: string;
  full_name: string;
  avatar: string;
}

export interface ChatMessage {
  message_id: number;
  sender: 'Student' | 'Darwin' | 'Gumball';
  message: string;
  created_at: Date;
  is_anonymous: number;
}

export interface InboxItem {
  student_id: string;
  name: string;
  avatar: string;
  is_anonymous: number;
  last_message?: string;
}

export interface StudyGroup {
  id: number;
  name: string;
  subject: string;
  classroom: string;
  created_by: string;
  created_at: string;
  creator_name?: string;
}

export interface Workshop {
  id: number;
  title: string;
  description: string;
  date: string;
  created_by: string;
  created_at: string;
}
