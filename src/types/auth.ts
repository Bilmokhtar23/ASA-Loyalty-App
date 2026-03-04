import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  university: z.string().optional(),
  student_id: z.string().optional(),
});

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'partner';
  points_balance: number;
  membership_status: 'pending' | 'active' | 'rejected';
  university?: string;
  student_id?: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};
