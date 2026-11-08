export interface SubscribeFormProps {
  name: string;
  email: string;
}

export interface SubscriberProps extends SubscribeFormProps {
  id: number;
  created_at: string;
}
