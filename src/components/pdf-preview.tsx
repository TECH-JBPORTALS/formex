export function PDFPreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center bg-accent w-full p-10">
      <div className="shadow-xl mr-72">{children}</div>
    </div>
  );
}
