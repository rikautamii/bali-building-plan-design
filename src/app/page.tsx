import dynamic from "next/dynamic";

const Main = dynamic(() => import("@/components/main"), {
  ssr: false,
});

export default function page() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Main />
    </div>
  );
}
