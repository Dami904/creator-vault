interface AlertProps {
  type: "error" | "success" | "warning" | "info";
  message: string;
}

const STYLES: Record<AlertProps["type"], string> = {
  error: "bg-red-900/30 border-red-700 text-red-300",
  success: "bg-green-900/30 border-green-700 text-green-300",
  warning: "bg-yellow-900/30 border-yellow-700 text-yellow-300",
  info: "bg-blue-900/30 border-blue-700 text-blue-300",
};

export function Alert({ type, message }: AlertProps) {
  return (
    <div className={`px-4 py-3 rounded-lg border text-sm ${STYLES[type]}`}>
      {message}
    </div>
  );
}
