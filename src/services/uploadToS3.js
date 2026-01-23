import { API_BASE } from "./apiService";

// Same logic as your other project, just using API_BASE
export default async function uploadToS3(file, folder = "cart-uploads") {
  try {
    // Step 1: Get signed URL
    const res = await fetch(
      `${API_BASE}/s3/generate-presigned-url?fileType=${encodeURIComponent(
        file.type
      )}&folder=${encodeURIComponent(folder)}`
    );

    if (!res.ok) throw new Error("Failed to get signed URL from server");

    const { signedUrl, publicUrl } = await res.json();

    // Step 2: Upload to S3
    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) throw new Error("Failed to upload file to S3");

    // Step 3: Return the public URL
    return publicUrl;
  } catch (err) {
    console.error("📤 S3 Upload Error:", err);
    throw err;
  }
}
