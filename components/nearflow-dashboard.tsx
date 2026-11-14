'use client'

import { useMemo, useRef, useState } from 'react'
import { Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, Bot, Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, Copy, ExternalLink, FileCheck2, Fingerprint, Globe2, History, LockKeyhole, Plus, Radio, RefreshCw, Send, ShieldCheck, Sparkles, Trash2, Wallet, X, Zap } from 'lucide-react'

type Contractor = { id: string; name: string; role: string; chain: string; address: string; amount: number; status: string; tx?: string }
const initial: Contractor[] = [
  { id: 'a', name: 'Alice Chen', role: 'Smart contract audit', chain: 'Solana', address: 'alice.sol', amount: 1800, status: 'AI Verified' },
  { id: 'b', name: 'Bob Martinez', role: 'Protocol engineering', chain: 'Base', address: '0x71C...89A', amount: 1450, status: 'AI Verified' },
  { id: 'c', name: 'Charlie Kim', role: 'Frontend development', chain: 'NEAR', address: 'charlie.near', amount: 1100, status: 'AI Verified' },
  { id: 'd', name: 'Diana Okafor', role: 'Research & analysis', chain: 'Arbitrum', address: '0x94B...22F', amount: 1350, status: 'AI Verified' },
]
const chainStyles: Record<string, string> = { Solana: 'chain-sol', Base: 'chain-base', Arbitrum: 'chain-arb', Ethereum: 'chain-eth', NEAR: 'chain-near' }
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const defaultPrompt = 'Audit Sprint #18 deliverables and pay Alice (alice.sol) 1800 USDC on Solana, Bob (0x71C...89A) 1450 USDC on Base, Charlie (charlie.near) 1100 USDC on NEAR, and Diana (0x94B...22F) 1350 USDC on Arbitrum.'

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <span className={`badge ${className}`}>{children}</span> }
function SectionTitle({ icon: Icon, eyebrow, title, right }: { icon: React.ElementType; eyebrow: string; title: string; right?: React.ReactNode }) { return <div className="section-title"><div className="section-icon"><Icon size={16} /></div><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{right && <div className="section-right">{right}</div>}</div> }

function parsePrompt(text: string): Contractor[] {
  const result: Contractor[] = []
  const pattern = /([\p{L}][\p{L}'-]*(?:\s+[\p{L}][\p{L}'-]*)?)\s*\(([^)]+)\)\s*([\d,]+(?:\.\d+)?)\s*USDC\s+on\s+(Solana|Base|Arbitrum|Ethereum|NEAR)/giu
  for (const match of text.matchAll(pattern)) {
    result.push({ id: crypto.randomUUID(), name: match[1].trim(), role: 'Verified deliverable', address: match[2].trim(), amount: Number(match[3].replaceAll(',', '')), chain: match[4][0].toUpperCase() + match[4].slice(1).toLowerCase(), status: 'AI Verified' })
  }
  return result
}

export default function NearFlowDashboard() {
  const [connected, setConnected] = useState(false)
  const [autonomous, setAutonomous] = useState(true)
  const [balance, setBalance] = useState(45000)
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [people, setPeople] = useState(initial)
  const [logs, setLogs] = useState<{ time: string; text: string; kind: string }[]>([
    { time: '09:41:02.184', text: 'NEAR AI Cloud TEE enclave initialized · Intel TDX', kind: 'system' },
    { time: '09:41:02.391', text: 'NEAR Intents solver network connected · 5 chains available', kind: 'success' },
    { time: '09:41:03.026', text: 'Treasury policy loaded · auto-approve threshold $5,000 USDC', kind: 'info' },
    { time: '09:41:03.118', text: 'Waiting for payroll instructions…', kind: 'muted' },
  ])
  const [proof, setProof] = useState('')
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState(-1)
  const [tab, setTab] = useState<'queue' | 'history'>('queue')
  const [history, setHistory] = useState<{ id: string; date: string; count: number; total: number; tx: string }[]>([])
  const [modal, setModal] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', chain: 'NEAR', address: '', amount: '' })
  const [copied, setCopied] = useState(false)
  const logEnd = useRef<HTMLDivElement>(null)
  const total = useMemo(() => people.reduce((sum, p) => sum + p.amount, 0), [people])
  const log = (text: string, kind = 'info') => setLogs(prev => [...prev, { time: new Date().toLocaleTimeString('en-US', { hour12: false }) + '.' + String(Date.now() % 1000).padStart(3, '0'), text, kind }])

  async function parseAndVerify() {
    const parsed = parsePrompt(prompt)
    if (!parsed.length) { log('No valid payouts found. Use: Name (wallet) amount USDC on Chain.', 'error'); return }
    setPeople(parsed); setProof(''); log(`Parsing payroll instructions · ${parsed.length} payout${parsed.length === 1 ? '' : 's'} detected`, 'info')
    log('Deliverable verification passed · policy threshold checked', 'success')
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${prompt}|nearflow-tee|${Date.now()}`))
    const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
    setProof(hash); log(`TEE attestation generated · sha256:${hash.slice(0, 16)}…`, 'success')
  }

  async function execute() {
    if (!connected) { log('Connect the NEAR Treasury before executing a batch.', 'error'); return }
    if (!people.length || total > balance) { log(total > balance ? 'Insufficient treasury balance for this batch.' : 'Add at least one payout before executing.', 'error'); return }
    setBusy(true)
    const stages = [
      'TEE auditing contractor deliverables & policy compliance…',
      'Constructing single NEP-413 signed NEAR Intent payload…',
      'Intent Solver routing liquidity across destination chains…',
      'Settlement confirmed · all contractor payouts completed',
    ]
    for (let i = 0; i < stages.length; i++) {
      setStep(i); setPeople(prev => prev.map(p => ({ ...p, status: ['TEE Auditing…', 'Intent Solver Routing…', 'Intent Solver Routing…', 'Settled ✓'][i] })))
      log(stages[i], i === 3 ? 'success' : 'info')
      await new Promise(resolve => setTimeout(resolve, 950))
    }
    const tx = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('')
    setPeople(prev => prev.map(p => ({ ...p, status: 'Settled ✓', tx: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, '0')).join('') })))
    setBalance(prev => prev - total); setHistory(prev => [{ id: `NF-${Date.now().toString().slice(-6)}`, date: new Date().toLocaleString(), count: people.length, total, tx }, ...prev]); setTab('history'); setBusy(false); log(`Batch settled · ${people.length} payouts · ${fmt(total)} USDC · ${tx.slice(0, 18)}…`, 'success')
  }

  function addContractor(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.address.trim() || !Number(form.amount) || Number(form.amount) <= 0) return
    setPeople(prev => [...prev, { ...form, id: crypto.randomUUID(), amount: Number(form.amount), status: 'AI Verified' }]); log(`Manual payout added · ${form.name} · ${form.amount} USDC on ${form.chain}`, 'info'); setForm({ name: '', role: '', chain: 'NEAR', address: '', amount: '' }); setShowAdd(false)
  }

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#overview" aria-label="NEARFlow AI home"><span className="brand-mark"><Activity size={19} strokeWidth={2.5} /></span><span className="brand-name">NEAR<span>Flow</span><i> AI</i></span><span className="brand-tag">BETA</span></a><div className="top-center"><span className="powered"><Sparkles size={12} /> Powered by NEAR Intents <span className="dot-sep">·</span> NEAR AI Cloud</span><span className="tee-status"><span className="pulse-dot" /> NEAR AI TEE Enclave <span className="status-active">Active</span><span className="status-chip">INTEL TDX</span></span></div><div className="top-actions"><button className="text-button architecture" onClick={() => setModal(true)}><CircleHelp size={15} /> How it works</button><button className={`wallet-button ${connected ? 'is-connected' : ''}`} onClick={() => { setConnected(v => !v); log(connected ? 'Treasury wallet disconnected.' : 'Treasury connected · dao-treasury.near', connected ? 'muted' : 'success') }}><Wallet size={15} />{connected ? 'dao-treasury.near' : 'Connect Treasury'}<span className={`wallet-indicator ${connected ? 'connected' : ''}`} /></button></div></header>
    <div className="page-wrap">
      <section className="page-heading" id="overview"><div><div className="breadcrumb"><span>WORKSPACE</span><span>/</span><span className="crumb-current">PAYROLL OVERVIEW</span></div><h1>Autonomous <span>payroll.</span></h1><p>Global payouts, one intent. Private by design, verified by AI.</p></div><div className="heading-meta"><span className="live-label"><span className="pulse-dot" /> LIVE NETWORK</span><span className="heading-date">FRIDAY, NOV 14, 2026</span></div></section>

      <section className="treasury-card"><div className="treasury-glow" /><div className="treasury-left"><div className="treasury-label"><span className="tiny-chain"><Activity size={13} /></span> UNIFIED TREASURY <span className="badge badge-live">ON-CHAIN</span></div><div className="balance"><span className="currency">$</span>{fmt(balance).split('.')[0]}<span className="balance-cents">.{fmt(balance).split('.')[1]}</span><span className="balance-unit">USDC</span></div><div className="treasury-bottom"><span className="chain-indicator"><i /> NEAR Protocol</span><span className="vertical-rule" /><span className="treasury-address"><Wallet size={13} /> dao-treasury.near</span></div></div><div className="treasury-divider" /><div className="treasury-stats"><div className="stat-item"><span className="stat-label">GAS SPONSORED</span><strong>0.00 <small>NEAR</small></strong><span className="stat-sub"><Zap size={12} /> NEAR Relayer</span></div><div className="stat-item"><span className="stat-label">THIS MONTH</span><strong>${fmt(0)} <small>USDC</small></strong><span className="stat-sub"><ArrowUpRight size={12} /> {history.length} settled batch{history.length === 1 ? '' : 'es'}</span></div></div><button className="topup-button" onClick={() => { setBalance(v => v + 10000); log('Treasury topped up · +10,000.00 USDC', 'success') }}><Plus size={15} /> Top up <span>$10k</span></button></section>

      <div className="dashboard-grid"><section className="panel agent-panel"><SectionTitle icon={Bot} eyebrow="NEAR AI CLOUD · PRIVATE INFERENCE" title="Autonomous agent" right={<span className="model-badge"><span className="pulse-dot" /> TEE ACTIVE</span>} /><div className="agent-body"><div className="mode-row"><div className="mode-copy"><span className="mode-label">Autonomous execution</span><span className="mode-caption">Agent can execute compliant payouts</span></div><button className={`toggle ${autonomous ? 'toggle-on' : ''}`} role="switch" aria-checked={autonomous} aria-label="Autonomous execution mode" onClick={() => { setAutonomous(v => !v); log(`Autonomous execution mode ${autonomous ? 'disabled' : 'enabled'}`, 'info') }}><span /></button></div><div className="policy-box"><span className="policy-icon"><ShieldCheck size={15} /></span><div><span className="policy-title">ACTIVE TREASURY POLICY</span><p>Auto-approve & settle payouts under <b>$5,000 USDC</b> after GitHub PR or deliverable verification.</p></div><ChevronDown size={14} className="policy-chevron" /></div><label className="input-label" htmlFor="payroll-prompt"><span>NATURAL LANGUAGE INSTRUCTIONS</span><span className="secure-label"><LockKeyhole size={11} /> ENCRYPTED IN TEE</span></label><textarea id="payroll-prompt" className="prompt-input" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe who to pay, how much, and on which chain…" rows={5} /><div className="prompt-footer"><span>{prompt.length} characters <span className="dot-sep">·</span> English</span><button className="parse-button" onClick={parseAndVerify}><Sparkles size={14} /> Parse & verify <ArrowRight size={13} /></button></div>{proof && <div className="proof-box"><div className="proof-icon"><Fingerprint size={15} /></div><div className="proof-text"><span>TEE ATTESTATION <b>VERIFIED</b></span><code>{proof}</code></div><button className="icon-button" aria-label="Copy attestation hash" onClick={() => { navigator.clipboard?.writeText(proof); setCopied(true); setTimeout(() => setCopied(false), 1400) }}>{copied ? <Check size={14} /> : <Copy size={14} />}</button></div>}<div className="privacy-note"><LockKeyhole size={12} /> Inference runs inside Intel TDX. Payroll data never leaves the enclave.</div></div></section>

      <section className="panel queue-panel"><div className="queue-heading"><SectionTitle icon={Send} eyebrow="NEAR INTENTS · ONE SIGNATURE" title="Payout batch" right={<span className="batch-counter">{people.length.toString().padStart(2, '0')} RECIPIENTS</span>} /><div className="tab-row"><button className={`tab ${tab === 'queue' ? 'active' : ''}`} onClick={() => setTab('queue')}><Send size={13} /> Queue <span>{people.length}</span></button><button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}><History size={13} /> History <span>{history.length}</span></button></div></div>
        {tab === 'queue' ? <><div className="table-wrap"><table className="payout-table"><thead><tr><th>CONTRACTOR</th><th>DESTINATION</th><th>VERIFICATION</th><th className="amount-col">PAYOUT</th><th aria-label="Remove" /></tr></thead><tbody>{people.map(p => <tr key={p.id}><td><div className="person-cell"><span className={`avatar avatar-${p.chain.toLowerCase()}`}>{p.name.split(' ').map(x => x[0]).join('').slice(0, 2)}</span><span><strong>{p.name}</strong><small>{p.role}</small></span></div></td><td><div className="dest-cell"><Badge className={chainStyles[p.chain] || 'chain-near'}><span className="chain-dot" />{p.chain}</Badge><span className="wallet-address" title={p.address}>{p.address}</span></div></td><td><span className={`verify-state ${p.status === 'Settled ✓' ? 'settled-state' : p.status.includes('…') ? 'auditing-state' : ''}`}>{p.status === 'AI Verified' ? <CheckCircle2 size={13} /> : p.status === 'Settled ✓' ? <Check size={13} /> : <RefreshCw size={12} className="spin" />}{p.status}</span></td><td className="amount-col"><strong className="payout-amount">${fmt(p.amount)}</strong><small>USDC</small></td><td><button className="remove-button" onClick={() => { setPeople(prev => prev.filter(x => x.id !== p.id)); log(`Removed ${p.name} from payout queue`, 'muted') }} aria-label={`Remove ${p.name}`}><Trash2 size={13} /></button></td></tr>)}</tbody></table>{!people.length && <div className="empty-state"><div className="empty-icon"><Send size={19} /></div><strong>Your payout queue is clear</strong><span>Parse instructions or add a contractor to get started.</span></div>}</div><div className="queue-controls"><button className="add-button" onClick={() => setShowAdd(v => !v)}><Plus size={14} /> Add contractor</button><span className="settlement-note"><Globe2 size={13} /> Cross-chain settlement enabled</span></div><div className="batch-total"><div><span className="total-label">BATCH TOTAL</span><span className="total-count">{people.length} payouts <span>·</span> fees sponsored</span></div><div className="total-value"><span>$</span>{fmt(total)} <small>USDC</small></div></div><button className="execute-button" disabled={busy || !people.length || !autonomous} onClick={execute}>{busy ? <><RefreshCw size={15} className="spin" /> Executing stage {step + 1} of 4…</> : <><Zap size={15} fill="currentColor" /> Execute autonomous batch <span className="intent-pill">1 NEAR INTENT</span><ArrowRight size={15} /></>}</button><div className="execute-caption"><LockKeyhole size={11} /> NEP-413 signed <span>·</span> TEE attested <span>·</span> gas sponsored</div></> : <div className="history-content">{history.length ? history.map(batch => <div className="history-row" key={batch.id}><span className="history-icon"><CheckCircle2 size={16} /></span><div className="history-main"><strong>{batch.id}</strong><span>{batch.date} · {batch.count} contractors</span></div><strong className="history-amount">${fmt(batch.total)} <small>USDC</small></strong><a className="explorer-link" href={`https://nearblocks.io/txns/${batch.tx}`} target="_blank" rel="noreferrer" aria-label="View batch on explorer"><ExternalLink size={14} /></a></div>) : <div className="empty-state history-empty"><div className="empty-icon"><History size={19} /></div><strong>No settled batches yet</strong><span>Completed cross-chain payouts will show up here.</span></div>}</div>}
      </section></div>

      {showAdd && <section className="panel add-form-panel"><div className="add-form-head"><div><span className="eyebrow">MANUAL ENTRY</span><h2>Add a contractor</h2></div><button className="icon-button" onClick={() => setShowAdd(false)} aria-label="Close form"><X size={16} /></button></div><form className="add-form" onSubmit={addContractor}><label>Name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jordan Lee" /></label><label>Role<input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Product design" /></label><label>Wallet address<input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="jordan.near" /></label><label>Blockchain<select value={form.chain} onChange={e => setForm({ ...form, chain: e.target.value })}>{['NEAR', 'Solana', 'Base', 'Arbitrum', 'Ethereum'].map(c => <option key={c}>{c}</option>)}</select></label><label>Amount (USDC)<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="1250.00" /></label><button className="parse-button" type="submit"><Plus size={14} /> Add to queue</button></form></section>}

      <section className="panel terminal-panel"><div className="terminal-head"><div className="terminal-title"><span className="terminal-symbol"><Radio size={14} /></span><div><span className="eyebrow">NETWORK ACTIVITY</span><h2>Relayer terminal</h2></div><span className="terminal-live"><i /> STREAMING</span></div><button className="clear-button" onClick={() => setLogs([])}>Clear logs <X size={12} /></button></div><div className="terminal-body" role="log" aria-live="polite">{logs.length ? logs.map((entry, i) => <div className="log-line" key={`${entry.time}-${i}`}><span className="log-time">{entry.time}</span><span className={`log-mark mark-${entry.kind}`}>{entry.kind === 'success' ? '✓' : entry.kind === 'error' ? '!' : '›'}</span><span className={`log-text text-${entry.kind}`}>{entry.text}</span></div>) : <div className="logs-empty">Terminal cleared. New network events will appear here.</div>}<div ref={logEnd} /></div><div className="terminal-foot"><span><span className="pulse-dot" /> Connected to NEAR relayer</span><span>TEE SESSION <b>NF-8F2A1</b></span><span>LATENCY <b>42ms</b></span></div></section>
      <footer className="page-footer"><span>NEARFlow AI <span className="footer-sep">/</span> HACKATHON 2026</span><span>BUILT ON <b>NEAR</b> <span className="footer-sep">·</span> PRIVACY VERIFIED</span></footer>
    </div>
    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false) }}><section className="architecture-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={() => setModal(false)} aria-label="Close"><X size={17} /></button><div className="modal-mark"><Activity size={22} /></div><span className="eyebrow">THE NEARFLOW ARCHITECTURE</span><h2 id="modal-title">Payroll without borders.<br /><span>Privacy without compromise.</span></h2><p className="modal-intro">NEARFlow combines confidential AI verification with intent-based settlement to make global contractor payroll feel like one transaction.</p><div className="architecture-steps"><article><span className="arch-number">01</span><span className="arch-icon"><ShieldCheck size={18} /></span><div><h3>Private AI audit</h3><p>NEAR AI Cloud runs deliverable checks inside an Intel TDX Trusted Execution Environment. Sensitive payroll instructions stay encrypted in the enclave; a SHA-256 attestation makes the inference verifiable.</p></div></article><article><span className="arch-number">02</span><span className="arch-icon"><Fingerprint size={18} /></span><div><h3>One signed intent</h3><p>A single NEP-413 payload carries the approved batch and treasury policy. The autonomous agent only proceeds when each payout passes the configured verification rules.</p></div></article><article><span className="arch-number">03</span><span className="arch-icon"><Globe2 size={18} /></span><div><h3>Cross-chain settlement</h3><p>NEAR Intents solvers source and route liquidity to each destination chain. Contractors receive their preferred asset without your team manually bridging, swapping, or managing gas.</p></div></article></div><div className="modal-foot"><span><LockKeyhole size={13} /> Verifiable. Non-custodial. Chain-abstracted.</span><button className="parse-button" onClick={() => setModal(false)}>Got it <ArrowRight size={13} /></button></div></section></div>}
  </main>
}
