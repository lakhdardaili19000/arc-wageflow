"use client";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, isAddress } from "viem";
import { Shell25, Brand } from "./shells";
import { DefiPanel } from "./DefiPanel";
const cAddr = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0") as `0x${string}`;
const abi = [
  { name: "create", type: "function", stateMutability: "payable", inputs: [{ name: "payee", type: "address" }, { name: "ratePerDay", type: "uint256" }], outputs: [{ type: "uint256" }] },,  { name: "accrued", type: "function", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{ type: "uint256" }] },,  { name: "withdraw", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },,  { name: "stop", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },,  { name: "get", type: "function", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{ type: "tuple", components: [{ name: "payer", type: "address" }, { name: "payee", type: "address" }, { name: "ratePerDay", type: "uint256" }, { name: "start", type: "uint256" }, { name: "funded", type: "uint256" }, { name: "withdrawn", type: "uint256" }, { name: "active", type: "bool" }, { name: "createdAt", type: "uint256" }] }] },,  { name: "total", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;
const cut = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const toUsd = (w?: bigint) => w === undefined ? "0.00" : Number(formatEther(w)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const brand: Brand = { name: "Arc Wageflow", sub: "Real-time payroll", emoji: "💼", color: "teal", font: '"Garamond","Hoefler Text",serif', shape: "rounded-lg", hero: "Continuous payouts", herosub: "Native USDC/EURC pool built in." };
function Card({ id, me, working, run }: { id: bigint; me?: string; working: boolean; run: (fn: string, args: any[], v?: bigint) => void }) {
  const { data: it } = useReadContract({ address: cAddr, abi, functionName: "get", args: [id] });
  const [amt, setAmt] = useState("");
  if (!it) return null;
  const done = false;
  return (
    <div className="bg-[var(--card)] border border-[color:var(--cardb)] rounded-[var(--rad)] p-4 space-y-2 hover:border-teal-500/40 transition-colors">
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-teal-500/15 grid place-items-center text-lg shrink-0">💼</div>
        <div className="flex-1 min-w-0"><div className="font-bold text-[color:var(--txt)]">${toUsd(it.funded)}</div><div className="text-[11px] text-[color:var(--mut)] truncate">{`#${id}`}</div></div>
        <span className="text-[11px] bg-[var(--ipt)] px-2 py-1 rounded-full shrink-0">{done ? "Done ✓" : "Open"}</span></div>
      {!done && <div className="flex flex-wrap items-center gap-2"><button onClick={()=>run("withdraw",[id])} disabled={working} className="px-2.5 py-1.5 bg-[var(--btn2)] text-[color:var(--txt)] rounded-lg hover:bg-gray-600 disabled:opacity-40 text-xs">{working?"…":"Withdraw"}</button><button onClick={()=>run("stop",[id])} disabled={working} className="px-2.5 py-1.5 bg-[var(--btn2)] text-[color:var(--txt)] rounded-lg hover:bg-gray-600 disabled:opacity-40 text-xs">{working?"…":"Stop"}</button></div>}
    </div>
  );
}
export default function App() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState("home");
  const [f, setF] = useState<any>({payee:"",rate:"30",amt:""});
  const { data: count } = useReadContract({ address: cAddr, abi, functionName: "total" });
  const { writeContract, data: tx, isPending, reset } = useWriteContract();
  const { isSuccess, isLoading: cfm } = useWaitForTransactionReceipt({ hash: tx, query: { enabled: !!tx } });
  useEffect(() => { if (isSuccess) { reset(); setF({payee:"",rate:"30",amt:""}); } }, [isSuccess]); // eslint-disable-line
  const working = isPending || cfm;
  const n = count !== undefined ? Number(count) : 0;
  const run = (fn: string, args: any[], v?: bigint) => writeContract({ address: cAddr, abi, functionName: fn as any, args, value: v });
  return (<Shell25 brand={brand} tabs={[["home", "Drips"], ["earn", "Stake"], ["swap", "Convert"]]} tab={tab} setTab={setTab}>
    {tab === "home" && <div className="space-y-4">
      <div className="bg-[var(--card)] border border-[color:var(--cardb)] rounded-[var(--rad)] p-6 space-y-3">
        <input value={f.payee} onChange={e=>setF(v=>({...v,payee:e.target.value}))} placeholder="Payee 0x…" type="text" className="w-full bg-[var(--ipt)] border border-[color:var(--iptb)] rounded-[var(--rad)] px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
        <input value={f.rate} onChange={e=>setF(v=>({...v,rate:e.target.value}))} placeholder="Rate / day" type="number" className="w-full bg-[var(--ipt)] border border-[color:var(--iptb)] rounded-[var(--rad)] px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--mut)]">$</span><input value={f.amt} onChange={e=>setF(v=>({...v,amt:e.target.value}))} type="number" placeholder="USDC amount" className="w-full bg-[var(--ipt)] border border-[color:var(--iptb)] rounded-[var(--rad)] pl-7 pr-3 py-2.5 text-sm focus:outline-none" /></div>
        <button onClick={() => run("create", [f.payee as `0x${string}`, parseEther(f.rate||"0")], parseEther(f.amt||"0"))} disabled={!isConnected || working || (!isAddress(f.payee) || !(Number(f.amt)>0))} className="w-full py-3 font-bold rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:opacity-90 disabled:opacity-40">{working ? "…" : "Launch drip 💼"}</button>
      </div>
      {n > 0 ? <div className="space-y-3">{Array.from({ length: n }, (_, i) => BigInt(n - 1 - i)).map(id => <Card key={id.toString()} id={id} me={address} working={working} run={run} />)}</div> : <div className="text-center text-sm text-[color:var(--mut)] py-8">Nothing yet 💼</div>}
    </div>}
    {tab === "earn" && <DefiPanel color="teal" show={["earn"]} note="Self-custodial AMM + savings vault, settled in USDC on Arc." />}
    {tab === "swap" && <DefiPanel color="teal" show={["swap"]} note="Self-custodial AMM + savings vault, settled in USDC on Arc." />}
  </Shell25>);
}