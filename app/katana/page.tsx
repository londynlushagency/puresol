export default async function KatanaPage() {
  const res = await fetch('http://localhost:3000/api/katana/inventory/get', {
    next: { revalidate: 0 } // optional: bypass caching
  });
  const data = await res.text();
  console.log(data);

  return (
    <div>
      <h1>Katana Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}