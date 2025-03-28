import Vapi from "@vapi-ai/web";

// Create a singleton instance to prevent KrispSDK duplication
let vapiInstance: Vapi | null = null;

export const vapi = (() => {
  if (!vapiInstance) {
    vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
  }
  return vapiInstance;
})();