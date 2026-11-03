import { useId } from 'react'

/** ATLAS mark, copied from the ATLAS module logo (gradient triangle). */
export function AtlasMark({ size = 34, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={Math.round((size * 145) / 162)} viewBox="0 0 162 145" fill="none" className={className} aria-hidden>
      <g clipPath={`url(#clip0_${id})`}>
      <path d="M2.26702 111.265C6.70029 103.525 63.7507 4.7879 63.7507 4.7879C65.4523 1.83596 68.587 0.0179996 71.9813 0C71.9903 0 72.0082 0 72.0172 0C75.4026 0 78.5283 1.79096 80.2478 4.7249L142.251 110.482H119.807L72.0888 28.6194L11.7784 133.17C11.7784 133.17 12.6203 138.156 13.0502 140.955C11.8321 139.425 5.63451 129.876 2.40136 125.061C-0.840753 120.247 -0.715368 116.476 2.26702 111.265Z" fill={`url(#paint0_linear_${id})`}/>
      <path d="M2.26813 111.265C-0.71425 116.476 -0.839635 120.247 2.39352 125.061C5.63563 129.876 11.8243 139.425 13.0423 140.955C12.6214 138.156 11.7706 133.17 11.7706 133.17L30.65 100.438L14.8873 89.3772C8.34038 100.726 3.45034 109.213 2.26813 111.265Z" fill={`url(#paint1_linear_${id})`}/>
      <path d="M139.999 145.5C147.791 145.5 147.997 142.746 150.317 139.578C152.636 136.401 157.894 127.311 157.894 127.311C157.894 127.311 39.8164 127.311 35.822 127.311C33.6546 127.311 33.1979 125.817 34.0935 124.233C35.8399 121.155 80.7996 43.5318 80.7996 43.5318L72.0853 28.6191C72.0853 28.6191 13.2795 130.587 11.6853 133.332C8.91786 138.075 12.2585 145.491 22.8536 145.491C33.4486 145.491 133.273 145.5 139.999 145.5Z" fill={`url(#paint2_linear_${id})`}/>
      <path d="M71.9808 0C76.5843 0 87.036 0 90.0184 0C93.0008 0 96.7445 0.557988 100.497 6.72286C104.241 12.8877 157.485 106.378 160.387 111.76C163.7 117.907 159.795 124.899 157.906 127.302C152.711 127.302 39.5597 127.302 35.834 127.302C32.1082 127.302 33.6129 125.088 34.1055 124.224C34.598 123.36 41.9689 110.617 41.9689 110.617L142.268 110.464C142.268 110.464 81.6176 6.76786 80.2652 4.7069C78.7248 2.40295 77.453 0.548989 71.9808 0Z" fill={`url(#paint3_linear_${id})`}/>
      <path d="M114.945 127.311L106.535 145.5C123.892 145.5 137.658 145.5 140.013 145.5C147.805 145.5 148.011 142.746 150.331 139.578C152.641 136.401 157.907 127.311 157.907 127.311C157.907 127.311 138.383 127.311 114.945 127.311Z" fill={`url(#paint4_linear_${id})`}/>
      <path d="M80.7923 43.5318L72.087 28.6191C72.087 28.6191 63.3369 43.7928 52.5 62.5844L62.504 75.1212C72.2661 58.2465 80.7923 43.5318 80.7923 43.5318Z" fill={`url(#paint5_linear_${id})`}/>
      <path d="M142.249 110.473L126.343 83.3477H103.988L119.805 110.473H142.249Z" fill={`url(#paint6_linear_${id})`}/>
      <path d="M41.96 110.625C41.96 110.625 34.598 123.369 34.1055 124.233C33.6129 125.097 32.1082 127.311 35.834 127.311C37.2938 127.311 55.5553 127.311 77.5426 127.311L72.8675 110.58L41.96 110.625Z" fill={`url(#paint7_linear_${id})`}/>
      <path d="M100.508 6.72286C96.7558 0.557988 93.0122 0 90.0298 0C87.0474 0 76.5956 0 71.9922 0C77.4644 0.548989 79.3272 3.07794 80.2587 4.7249C82.4619 8.61282 89.1789 19.5656 99.5053 37.1962H118.027C109.017 21.4286 101.798 8.85582 100.508 6.72286Z" fill={`url(#paint8_linear_${id})`}/>
      <path d="M133.104 94.8581L132.19 95.407L80.8984 7.64985L81.8209 7.10986L133.104 94.8581Z" fill={`url(#paint9_linear_${id})`}/>
      <path d="M18.899 120.994L17.9766 120.463L68.695 32.3728L69.6175 32.9038L18.899 120.994Z" fill={`url(#paint10_linear_${id})`}/>
      <path d="M36.9453 128.356V127.285L138.221 127.294V128.356H36.9453Z" fill={`url(#paint11_linear_${id})`}/>
      </g>
      <defs>
      <linearGradient id={`paint0_linear_${id}`} x1="69.7063" y1="92.0691" x2="64.1899" y2="5.56042" gradientUnits="userSpaceOnUse">
      <stop stopColor="#B567FF"/>
      <stop offset="1" stopColor="#AF9BFF"/>
      </linearGradient>
      <linearGradient id={`paint1_linear_${id}`} x1="23.235" y1="100.772" x2="5.04193" y2="128.774" gradientUnits="userSpaceOnUse">
      <stop stopColor="#D8C4FF" stopOpacity="0"/>
      <stop offset="1" stopColor="white"/>
      </linearGradient>
      <linearGradient id={`paint2_linear_${id}`} x1="90.123" y1="120.176" x2="115.148" y2="73.0764" gradientUnits="userSpaceOnUse">
      <stop stopColor="#E1AEFF"/>
      <stop offset="1" stopColor="#E2BCFF"/>
      </linearGradient>
      <linearGradient id={`paint3_linear_${id}`} x1="107.013" y1="66.4643" x2="36.6846" y2="91.1654" gradientUnits="userSpaceOnUse">
      <stop stopColor="#F5D1FF"/>
      <stop offset="1" stopColor="#DB6EFF"/>
      </linearGradient>
      <linearGradient id={`paint4_linear_${id}`} x1="113.235" y1="137.54" x2="166.115" y2="133.508" gradientUnits="userSpaceOnUse">
      <stop stopColor="#CEABFF" stopOpacity="0"/>
      <stop offset="1" stopColor="white"/>
      </linearGradient>
      <linearGradient id={`paint5_linear_${id}`} x1="61.3553" y1="59.6349" x2="84.3888" y2="29.8166" gradientUnits="userSpaceOnUse">
      <stop stopColor="#C98FFF" stopOpacity="0"/>
      <stop offset="1" stopColor="white"/>
      </linearGradient>
      <linearGradient id={`paint6_linear_${id}`} x1="130.466" y1="113.721" x2="119.05" y2="87.858" gradientUnits="userSpaceOnUse">
      <stop stopColor="#BA82E5"/>
      <stop offset="1" stopColor="#8B3BFB" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id={`paint7_linear_${id}`} x1="33.3797" y1="118.943" x2="77.536" y2="118.943" gradientUnits="userSpaceOnUse">
      <stop stopColor="#BB7CFF"/>
      <stop offset="1" stopColor="#E6A2FF" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id={`paint8_linear_${id}`} x1="103.883" y1="38.0501" x2="86.1508" y2="-0.430834" gradientUnits="userSpaceOnUse">
      <stop stopColor="#CE79FF" stopOpacity="0"/>
      <stop offset="1" stopColor="#B580FF"/>
      </linearGradient>
      <linearGradient id={`paint9_linear_${id}`} x1="80.9" y1="51.2564" x2="133.108" y2="51.2564" gradientUnits="userSpaceOnUse">
      <stop stopColor="white" stopOpacity="0"/>
      <stop offset="0.4822" stopColor="white"/>
      <stop offset="1" stopColor="white" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id={`paint10_linear_${id}`} x1="30.9333" y1="53.861" x2="56.8492" y2="99.4017" gradientUnits="userSpaceOnUse">
      <stop stopColor="white" stopOpacity="0"/>
      <stop offset="0.4822" stopColor="white"/>
      <stop offset="1" stopColor="white" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id={`paint11_linear_${id}`} x1="100.808" y1="105.205" x2="74.1709" y2="150.328" gradientUnits="userSpaceOnUse">
      <stop stopColor="white" stopOpacity="0"/>
      <stop offset="0.4822" stopColor="white"/>
      <stop offset="1" stopColor="#D34DFF" stopOpacity="0"/>
      </linearGradient>
      <clipPath id={`clip0_${id}`}>
      <rect width="161.667" height="144.793" fill="white"/>
      </clipPath>
      </defs>
      
    </svg>
  )
}
