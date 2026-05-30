"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FileCheck, FileText, LockKeyhole, ReceiptText, ShieldCheck, Upload } from "lucide-react";

import MobileHeader from "@/components/MobileHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { getStoredNostrUser } from "@/lib/nostr";
import { BusinessProfile, LocalCurrency, VaultDocument, VaultDocumentType } from "@/lib/types";
import {
  currencyOptions,
  defaultNostrProfile,
  formatLocalAmount,
  loadLocalVaultDocuments,
  normalizeProfile,
  getVaultProofId,
  saveLocalVaultDocuments,
} from "@/lib/businessData";

const documentTypes: { value: VaultDocumentType; label: string }[] = [
  { value: "receipt", label: "Receipt" },
  { value: "invoice", label: "Invoice" },
  { value: "permit", label: "Permit" },
  { value: "contract", label: "Contract" },
  { value: "other", label: "Other" },
];

const documentTypeLabels = documentTypes.reduce<Record<string, string>>((labels, item) => {
  labels[item.value] = item.label;
  return labels;
}, {});

const emptyForm = {
  title: "",
  documentType: "receipt" as VaultDocumentType,
  amount: "",
  currency: "NGN" as LocalCurrency,
  note: "",
};

export default function VaultPage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const nostrUser = getStoredNostrUser();

      if (user) {
        const [{ data: profileData }, { data: vaultData }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("vault_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        ]);

        if (!mounted) return;
        if (profileData) setProfile(normalizeProfile(profileData));
        setDocuments(await signVaultDocuments(vaultData || []));
      } else if (nostrUser) {
        const localProfile = localStorage.getItem(`profile_${nostrUser.pubkey}`);
        if (!mounted) return;
        setProfile(localProfile ? normalizeProfile(JSON.parse(localProfile)) : defaultNostrProfile(nostrUser));
        setDocuments(loadLocalVaultDocuments(nostrUser.pubkey));
      }

      if (mounted) setIsLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const vaultStats = useMemo(() => {
    const receipts = documents.filter((doc) => doc.document_type === "receipt").length;
    const totalValue = documents.reduce((sum, doc) => sum + Number(doc.amount || 0), 0);
    // Default to NGN for the aggregate stat to avoid confusion with mixed records
    const currency = "NGN";

    return { receipts, totalValue, currency };
  }, [documents]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const nostrUser = getStoredNostrUser();
      const baseRecord = {
        title: form.title.trim(),
        document_type: form.documentType,
        note: form.note.trim(),
        amount: form.amount ? Number(form.amount) : null,
        currency: form.currency,
        file_name: file?.name || "",
      };

      if (user) {
        let filePath = "";

        if (file) {
          const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
          filePath = `${user.id}/${Date.now()}-${cleanName}`;
          const { error: uploadError } = await supabase.storage.from("vault").upload(filePath, file, { upsert: false });
          if (uploadError) {
            filePath = "";
            console.warn("Vault upload skipped:", uploadError.message);
          }
        }

        const { data, error } = await supabase
          .from("vault_documents")
          .insert({ ...baseRecord, user_id: user.id, file_path: filePath })
          .select("*")
          .single();

        if (error) throw error;
        const [signedDocument] = await signVaultDocuments([data]);
        setDocuments((current) => [signedDocument, ...current]);
      } else if (nostrUser) {
        const fileUrl = file ? await readFileAsDataUrl(file) : "";
        const nextDocument: VaultDocument = {
          ...baseRecord,
          id: Date.now(),
          owner_pubkey: nostrUser.pubkey,
          amount: baseRecord.amount || undefined,
          file_url: fileUrl,
          created_at: new Date().toISOString(),
        };
        const nextDocuments = [nextDocument, ...loadLocalVaultDocuments(nostrUser.pubkey)];
        saveLocalVaultDocuments(nostrUser.pubkey, nextDocuments);
        setDocuments(nextDocuments);
      }

      setForm(emptyForm);
      setFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save that document.";
      alert(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteDocument(id: number) {
    const { data: { user } } = await supabase.auth.getUser();
    const nostrUser = getStoredNostrUser();

    if (user) {
      await supabase.from("vault_documents").delete().eq("id", id).eq("user_id", user.id);
      setDocuments((current) => current.filter((doc) => doc.id !== id));
      return;
    }

    if (nostrUser) {
      const nextDocuments = loadLocalVaultDocuments(nostrUser.pubkey).filter((doc) => doc.id !== id);
      saveLocalVaultDocuments(nostrUser.pubkey, nextDocuments);
      setDocuments(nextDocuments);
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-lime-50 flex flex-col md:flex-row">
        <Sidebar profile={profile} />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader />
          <div className="p-4 md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-slate-500">Business document storage</p>
                <h1 className="text-4xl font-bold text-[#0F172A] mt-2">Vault</h1>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-lime-100 bg-white px-4 py-3 text-sm font-bold text-lime-700 shadow-sm w-fit">
                <LockKeyhole className="h-4 w-4" />
                Private business records
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mt-8">
              <VaultStat icon={ShieldCheck} label="Stored Records" value={documents.length.toString()} />
              <VaultStat icon={ReceiptText} label="Receipts" value={vaultStats.receipts.toString()} />
              <VaultStat icon={FileCheck} label="Recorded Value" value={formatLocalAmount(vaultStats.totalValue, vaultStats.currency)} />
            </div>

            <div className="grid xl:grid-cols-[400px_1fr] gap-8 mt-8">
              <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-[32px] p-6 shadow-sm h-fit">
                <h2 className="text-xl font-bold text-slate-900">Add Document</h2>
                <div className="space-y-5 mt-6">
                  <VaultInput label="Record Title" value={form.title} placeholder="Market receipt, CAC permit, supply contract" onChange={(value) => setForm({ ...form, title: value })} />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {documentTypes.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setForm({ ...form, documentType: item.value })}
                          className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${form.documentType === item.value ? "border-lime-400 bg-lime-50 text-lime-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_110px] gap-3">
                    <VaultInput label="Amount" type="number" value={form.amount} placeholder="25000" onChange={(value) => setForm({ ...form, amount: value })} />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Currency</label>
                      <select
                        value={form.currency}
                        onChange={(event) => setForm({ ...form, currency: event.target.value as LocalCurrency })}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-4 text-black outline-none focus:border-lime-500 transition-colors bg-white"
                      >
                        {currencyOptions.map((currency) => (
                          <option key={currency.code} value={currency.code}>{currency.code}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Note</label>
                    <textarea
                      value={form.note}
                      onChange={(event) => setForm({ ...form, note: event.target.value })}
                      placeholder="Supplier name, customer details, warranty notes, or why this matters."
                      className="w-full min-h-28 border border-gray-200 rounded-2xl px-5 py-4 text-black outline-none focus:border-lime-500 transition-colors resize-none"
                    />
                  </div>

                  <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition hover:border-lime-400 hover:bg-lime-50/40">
                    <Upload className="h-6 w-6 text-slate-400" />
                    <span className="mt-3 text-sm font-bold text-slate-700">{file ? file.name : "Attach receipt or document"}</span>
                    <span className="mt-1 text-xs text-slate-400">PDF or image, optional</span>
                    <input type="file" accept="image/*,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="hidden" />
                  </label>

                  <button type="submit" disabled={isSaving || !form.title.trim()} className="w-full bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold transition active:scale-95 shadow-lg shadow-slate-200 disabled:opacity-60">
                    {isSaving ? "Saving Record..." : "Save to Vault"}
                  </button>
                </div>
              </form>

              <section className="bg-white/80 backdrop-blur-md border border-white rounded-[32px] p-6 shadow-sm min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Stored Records</h2>
                    <p className="text-sm text-slate-500 mt-1">Receipts, permits, contracts, and proofs behind your business.</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {isLoading ? (
                    [1, 2, 3].map((item) => <div key={item} className="h-24 rounded-3xl bg-slate-100 animate-pulse" />)
                  ) : documents.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/70">
                      <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                      <p className="mt-4 font-bold text-slate-700">No vault records yet</p>
                      <p className="text-sm text-slate-400 mt-1">Save your first receipt or business document to start building portable proof.</p>
                    </div>
                  ) : (
                    documents.map((document) => (
                      <article key={document.id} className="group flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-5 transition hover:border-lime-100 hover:shadow-sm md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="h-12 w-12 shrink-0 rounded-2xl bg-lime-50 text-lime-700 flex items-center justify-center">
                            <ReceiptText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-slate-900 truncate">{document.title}</h3>
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {documentTypeLabels[document.document_type] || "Record"}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{document.note || "No extra note added."}</p>
                            <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <span className="text-lime-600 bg-lime-50 px-2 py-0.5 rounded-md border border-lime-100">
                                {getVaultProofId(document.id)}
                              </span>
                              <span>Created {document.created_at ? new Date(document.created_at).toLocaleDateString() : "Today"}</span>
                              {document.updated_at && (
                                <span className="text-slate-500">Edited {new Date(document.updated_at).toLocaleDateString()}</span>
                              )}
                              {document.amount ? <span>{formatLocalAmount(document.amount, document.currency)}</span> : null}
                              <span className="text-slate-300">|</span>
                              <span className="truncate max-w-[120px]">Owner: {document.owner_pubkey || document.user_id || "System"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 md:justify-end">
                          {document.file_url ? (
                            <a href={document.file_url} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-lime-300 hover:text-lime-700">
                              Open Record
                            </a>
                          ) : null}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

async function signVaultDocuments(documents: VaultDocument[]) {
  return Promise.all(
    documents.map(async (document) => {
      if (!document.file_path) return document;
      const { data } = await supabase.storage.from("vault").createSignedUrl(document.file_path, 60 * 60);
      return { ...document, file_url: data?.signedUrl || "" };
    })
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function VaultInput({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-black outline-none focus:border-lime-500 transition-colors"
      />
    </div>
  );
}

function VaultStat({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-[28px] p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-slate-900 text-lime-300 flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-2xl font-black text-slate-900 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}
