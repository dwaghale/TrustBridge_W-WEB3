import {
  rpc,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { CONTRACT_ADDRESS, RPC_URL, NETWORK_PASSPHRASE } from "./constants";
import { Escrow } from "@/types";

const server = new rpc.Server(RPC_URL);

function getContract(): Contract {
  return new Contract(CONTRACT_ADDRESS);
}

function parseEscrow(raw: any): Escrow {
  return {
    buyer: raw.buyer?.toString() || "",
    seller: raw.seller?.toString() || "",
    arbitrator: raw.arbitrator?.toString() || "",
    token: raw.token?.toString() || "",
    amount: raw.amount?.toString() || "0",
    status: Number(raw.status || 0),
    buyer_approved: Boolean(raw.buyer_approved),
    seller_approved: Boolean(raw.seller_approved),
  };
}

export async function readContract(
  method: string,
  args: xdr.ScVal[],
  source?: string
): Promise<any> {
  const contract = getContract();
  const call = contract.call(method, ...args);
  const account = source
    ? await server.getAccount(source)
    : await server.getAccount(
        "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI"
      );
  const sim = await server.simulateTransaction(
    new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(call)
      .setTimeout(30)
      .build()
  );
  if ("error" in sim && sim.error) throw new Error(sim.error);
  const result = sim as rpc.Api.SimulateTransactionSuccessResponse;
  if (!result.result?.retval) throw new Error("No return value");
  return scValToNative(result.result.retval);
}

export async function readEscrow(id: number): Promise<Escrow> {
  const args = [nativeToScVal(id, { type: "u64" })];
  const raw = await readContract("get_escrow", args);
  return parseEscrow(raw);
}

export async function readEscrowCount(): Promise<number> {
  const raw = await readContract("get_count", []);
  return Number(raw);
}

export async function buildContractCall(
  method: string,
  args: xdr.ScVal[],
  source: string
) {
  const contract = getContract();
  const account = await server.getAccount(source);
  const call = contract.call(method, ...args);
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(call)
    .setTimeout(30)
    .build();
  return tx;
}

export async function submitTx(signedXdr: string): Promise<{
  hash: string;
  status: string;
}> {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendResult = await server.sendTransaction(tx);
  if (sendResult.status === "ERROR") {
    throw new Error(
      `Transaction failed: ${sendResult.errorResult?.result()?.switch()?.name || "Unknown error"}`
    );
  }
  const hash = sendResult.hash;
  let status: string = sendResult.status;
  let attempts = 0;
  while (status === "NOT_FOUND" && attempts < 30) {
    await new Promise((r) => setTimeout(r, 1000));
    const getResult = await server.getTransaction(hash);
    status = getResult.status;
    attempts++;
  }
  return { hash, status };
}
