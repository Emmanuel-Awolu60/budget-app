// export default function Button({ children, ...props }) {
//   return (
//     <button
//       {...props}
//       className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//     >
//       {children}
//     </button>
//   );
// }

export default function Button({
  children,
  className = "",
  loading = false,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`w-full rounded-lg px-4 py-2 font-medium border border-gray-900
                  bg-gray-900 text-white hover:bg-black disabled:opacity-60
                  transition ${className}`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
