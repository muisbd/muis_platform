import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

let configured = false;

function ensure() {
  if (configured) return env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret;
  if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
    cloudinary.config({
      cloud_name: env.cloudinaryCloudName,
      api_key: env.cloudinaryApiKey,
      api_secret: env.cloudinaryApiSecret
    });
    configured = true;
    return true;
  }
  return false;
}

export async function uploadBuffer(buffer, folder, filename) {
  if (!ensure()) {
    return null;
  }
  const dataUri = `data:application/octet-stream;base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: folder || 'muis',
    public_id: filename ? filename.replace(/\.[^.]+$/, '') : undefined,
    resource_type: 'auto'
  });
  return result.secure_url;
}

export function cloudinaryReady() {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
}
