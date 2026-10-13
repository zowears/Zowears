'use client';

export default function cloudinaryLoader({ src, width, quality }) {
  if (!src || typeof src !== 'string') {
    return '';
  }

  // Handle Cloudinary URLs
  if (src.includes('res.cloudinary.com')) {
    const uploadMarker = '/image/upload/';
    const uploadIndex = src.indexOf(uploadMarker);
    if (uploadIndex !== -1) {
      const prefix = src.slice(0, uploadIndex + uploadMarker.length);
      let rest = src.slice(uploadIndex + uploadMarker.length);

      // Desired dynamic optimization transformations:
      // f_auto: automatic modern format (AVIF / WebP) based on browser support
      // q_auto or q_<quality>: smart perceptual quality compression
      // w_<width>,c_limit: downscale to requested width without upscaling
      const q = quality ? `q_${quality}` : 'q_auto';
      const w = width ? `w_${width},c_limit` : '';
      const transforms = ['f_auto', q, w].filter(Boolean).join(',');

      // If the URL already contains transformation params, replace them
      if (/^(f_|q_|w_|c_|t_|b_|e_|o_|r_|a_)/.test(rest)) {
        rest = rest.replace(/^[^/]+\//, '');
      }

      return `${prefix}${transforms}/${rest}`;
    }
  }

  // Local static files or other external URLs
  return src;
}
