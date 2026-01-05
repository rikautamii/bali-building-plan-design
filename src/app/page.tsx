// import dynamic from "next/dynamic";

// const Main = dynamic(() => import("@/components/main"), {
//   ssr: false,
// });

import Main from "@/components/main";

export default function page() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Main />
    </div>
  );
}
