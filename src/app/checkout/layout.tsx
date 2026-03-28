// Checkout layout with progress indicator (step X of 7)

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav>
        <p>Checkout Progress: Step X of 7</p>
        {/* TODO: Dynamic progress indicator based on current route */}
      </nav>
      <main>{children}</main>
    </div>
  );
}
