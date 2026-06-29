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
