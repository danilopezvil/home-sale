type ItemDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ItemDetailPage({ params }: ItemDetailPageProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Item {params.id}</h1>
      <p className="mt-2 text-slate-600">Placeholder page for a single item.</p>
    </section>
  );
}
