export default function Page({ params }: { params: { candy: string } }) {
  return <div>{params.candy}</div>;
}
