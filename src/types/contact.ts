export interface ContactFormProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactProps extends ContactFormProps {
  id: number;
  created_at: string;
}
