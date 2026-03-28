// Account layout with sidebar nav

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <aside>
        <nav>
          <ul>
            <li><a href="/account/saved">Saved Cars</a></li>
            <li><a href="/account/orders">My Orders</a></li>
            <li><a href="/account/finance">Finance Documents</a></li>
            <li><a href="/account/settings">Settings</a></li>
          </ul>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
