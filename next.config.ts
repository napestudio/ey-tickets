/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    apiKey: process.env.API_KEY,
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [{
        protocol: "https",
        hostname: "placehold.co",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;