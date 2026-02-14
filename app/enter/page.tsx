import EnterClient from "./EnterClient";
import { AuthProvider } from "@/context/PocketContext";

export default function Page() {
  return (
    <AuthProvider>
      <EnterClient />
    </AuthProvider>
  );
}
