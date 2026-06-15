import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";
import { getConfig } from "@/lib/config";

export function createGraphClient(): Client {
  const cfg = getConfig();
  const credential = new ClientSecretCredential(
    cfg.azure.tenantId,
    cfg.azure.clientId,
    cfg.azure.clientSecret,
  );
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ["https://graph.microsoft.com/.default"],
  });
  return Client.initWithMiddleware({ authProvider });
}
