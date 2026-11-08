export interface ProfileProps {
  id: string;
  email: string | null;
  address: string | null;
  display_name: string | null;
  role: "customer" | "admin";
}
