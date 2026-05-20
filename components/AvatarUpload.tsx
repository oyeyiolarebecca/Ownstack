"use client";

import { ChangeEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, Loader2 } from "lucide-react";

interface AvatarUploadProps {
    url?: string;
    onUpload: (url: string) => void;
}

export default function AvatarUpload({ url, onUpload }: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false);

    async function upload(event: ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("You must select an image to upload.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            onUpload(data.publicUrl);
            
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md">
                    {url ? (
                        <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Camera size={32} />
                        </div>
                    )}
                </div>
                
                {uploading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
                    </div>
                )}

                <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition active:scale-95">
                    <Camera size={16} className="text-slate-600" />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={upload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Business Logo
            </p>
        </div>
    );
}
