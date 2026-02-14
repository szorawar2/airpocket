import CreateClient from "./CreateClient";
import { AuthProvider } from "@/context/PocketContext";

export default function Page() {
  return (
    <AuthProvider>
      <CreateClient />
    </AuthProvider>
  );
}
