/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com", "storage.googleapis.com"],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS,
    NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS,
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  },
};

module.exports = nextConfig;
