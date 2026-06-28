// Generated contract bindings placeholder.
// Run `stellar contract bindings typescript` to generate typed bindings:
//
//   cd client
//   stellar contract bindings typescript \
//     --network testnet \
//     --contract-id <CONTRACT_ADDRESS> \
//     --output-dir packages/contract
//
// This will auto-generate the full typed client in packages/contract/src/.

import { rpc, Contract, TransactionBuilder, nativeToScVal, scValToNative, xdr } from "@stellar/stellar-sdk";

// Until bindings are generated, the app uses raw contract calls via lib/soroban.ts
export const CONTRACT_ADDRESS_PLACEHOLDER = "";

export async function get_escrow(
  contractId: string,
  server: rpc.Server,
  id: number
): Promise<any> {
  const contract = new Contract(contractId);
  const args = [nativeToScVal(id, { type: "u64" })];
  const call = contract.call("get_escrow", ...args);

  // Simulate (read-only)
  const account = await server.getAccount(
    "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI"
  );
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: "Test SDF Network ; September 2015",
  })
    .addOperation(call)
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if ("error" in sim && sim.error) throw new Error(sim.error);
  const result = sim as rpc.Api.SimulateTransactionSuccessResponse;
  if (!result.result?.retval) return null;
  return scValToNative(result.result.retval);
}
