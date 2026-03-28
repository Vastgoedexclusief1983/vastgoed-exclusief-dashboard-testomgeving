export default function WoningAanmeldenPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Woning aanmelden</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <iframe
          title="Woning aanmelden"
          src="https://form.jotform.com/260135557520351"
          className="w-full"
          style={{ height: "85vh", border: 0 }}
          allow="geolocation; microphone; camera"
        />
      </div>
    </div>
  );
}
