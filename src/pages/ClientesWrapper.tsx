import { ClienteProvider } from "@/context/ClienteContext";
import Clientes from "./Clientes";

// Wrapper para adicionar o ClienteProvider
export default function ClientesWrapper() {
  return (
    <ClienteProvider>
      <Clientes />
    </ClienteProvider>
  );
}






