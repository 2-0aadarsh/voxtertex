export default function FormInput({ id, label, type = "text", value, onChange, placeholder, error = "" }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-gray-700">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          error ? "border-red-300 ring-2 ring-red-300" : "border-gray-300"
        }`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
