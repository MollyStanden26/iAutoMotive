// Auth layout — centered card container for all auth pages

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#F7F8F9" }}
    >
      <div
        className="w-full"
        style={{
          maxWidth: 460,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: "40px 36px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
