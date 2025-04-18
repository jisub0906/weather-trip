import "@/styles/globals.css";
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive" // beforeInteractive 대신 afterInteractive 사용
      />
      <Component {...pageProps} />
    </>
  );
}