import {NextConfig} from 'next';
 
const nextConfig: NextConfig = {
    images:{
        remotePatterns:[
            new URL("https://res.cloudinary.com/**")
        ]
    },
    // experimental:{
    //     serverActions:{
    //         bodySizeLimit: "10mb"
    //     }
    // }
};
 
export default nextConfig;