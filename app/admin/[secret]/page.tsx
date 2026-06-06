import AdminClient from "./AdminClient";

type Props = { params: Promise<{ secret: string }> };

export default async function AdminPage({ params }: Props) {
  const { secret } = await params;
  return <AdminClient secret={secret} />;
}