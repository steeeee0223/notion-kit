import { createClient } from "@supabase/supabase-js";

export function createSupabaseStorage(url: string, publishableKey: string) {
  const client = createClient(url, publishableKey);

  return {
    upload: async (
      bucket: string,
      path: string,
      file: Buffer,
      contentType: string,
    ) => {
      const { error } = await client.storage
        .from(bucket)
        .upload(path, file, { contentType, upsert: true });
      if (error) throw new Error(`Storage upload failed: ${error.message}`);
      const {
        data: { publicUrl },
      } = client.storage.from(bucket).getPublicUrl(path);
      return publicUrl;
    },
    remove: async (bucket: string, paths: string[]) => {
      const { error } = await client.storage.from(bucket).remove(paths);
      if (error) throw new Error(`Storage remove failed: ${error.message}`);
    },
    getPublicUrl: (bucket: string, path: string) => {
      const {
        data: { publicUrl },
      } = client.storage.from(bucket).getPublicUrl(path);
      return publicUrl;
    },
  };
}

export type SupabaseStorage = ReturnType<typeof createSupabaseStorage>;
