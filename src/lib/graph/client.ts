import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import {
  ClientCertificateCredential,
  ClientSecretCredential,
  ManagedIdentityCredential,
  type TokenCredential,
} from "@azure/identity";
import { getConfig } from "@/lib/config";

/**
 * Credential for application-permission Graph calls.
 *
 * A client secret is a bearer credential with tenant-wide reach: anyone holding
 * it can act as the app until it is rotated. Prefer, in order:
 *   1. managed-identity — no secret material exists anywhere
 *   2. certificate      — private key stays in the key store
 *   3. secret           — fallback, rotate on a schedule
 *
 * Whichever is used, the service principal must also be scoped to the awards
 * mailbox with an Exchange ApplicationAccessPolicy.
 */
export function createGraphCredential(): TokenCredential {
  const { azure } = getConfig();

  switch (azure.graphCredential) {
    case "managed-identity":
      return new ManagedIdentityCredential(
        azure.managedIdentityClientId
          ? { clientId: azure.managedIdentityClientId }
          : undefined,
      );

    case "certificate":
      return new ClientCertificateCredential(
        azure.tenantId,
        azure.clientId,
        // Path is validated as present at config load.
        { certificatePath: azure.certificatePath! },
      );

    case "secret":
    default:
      return new ClientSecretCredential(
        azure.tenantId,
        azure.clientId,
        azure.clientSecret,
      );
  }
}

export function createGraphClient(): Client {
  const authProvider = new TokenCredentialAuthenticationProvider(
    createGraphCredential(),
    { scopes: ["https://graph.microsoft.com/.default"] },
  );
  return Client.initWithMiddleware({ authProvider });
}
