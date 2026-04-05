export type TargetStatus = 'new' | 'sent' | 'replied' | 'consulting' | 'contracted' | 'rejected';
export type TargetCategory = 'BeautyOn' | 'CarOn' | 'EduOn' | 'ReviewOn' | 'CareOn' | 'InsureOn' | 'FactoryOn';
export type ProductTier = 'web' | 'native';

export interface Target {
  id: string;
  name: string;
  phone: string;
  address: string;
  category: TargetCategory;
  region: string;
  has_app: boolean;
  has_reservation: boolean;
  status: TargetStatus;
  product?: string;
  tier?: ProductTier;
  setup_fee?: number;
  monthly_fee?: number;
  contract_start?: string;
  contract_months?: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  target_id: string;
  template_id?: string;
  content: string;
  sent_at: string;
  status: 'pending' | 'sent' | 'failed';
  clicked: boolean;
  replied: boolean;
}

export interface Template {
  id: string;
  name: string;
  category: TargetCategory;
  content: string;
  variables: string[];
  send_count: number;
  reply_count: number;
}

export interface Contract {
  id: string;
  target_id: string;
  product: string;
  tier: ProductTier;
  setup_fee: number;
  monthly_fee: number;
  start_date: string;
  contract_months: number;
  status: 'active' | 'paused' | 'cancelled';
  signed_at?: string;
  targets?: { name: string; phone: string; category: string };
}

export interface Activity {
  id: string;
  target_id: string;
  type: 'call' | 'text' | 'visit' | 'memo' | 'contract';
  note: string;
  created_at: string;
}

export interface Quote {
  id: string;
  target_id: string;
  product: string;
  tier: ProductTier;
  setup_fee: number;
  monthly_fee: number;
  months: number;
  addons: Record<string, number>;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  created_at: string;
  targets?: { name: string; phone: string };
}

export interface Task {
  id: string;
  target_id?: string;
  contract_id?: string;
  type: 'onboarding' | 'delivery' | 'billing' | 'renewal';
  checklist: { label: string; done: boolean }[];
  status: 'pending' | 'in_progress' | 'done';
  due_date?: string;
  completed_at?: string;
}
