'use client';

import { useRef, ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  mediaSrcWebm?: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  mediaSrcWebm,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollAmount, setScrollAmount] = useState(0);
  const [videoActive, setVideoActive] = useState(false);
  const maxScrollAmount = 800;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollContainer = containerRef.current.closest('[role="main"]') as HTMLElement;
      const containerScrollTop = scrollContainer?.scrollTop || 0;

      const isVideoActive = rect.top <= 100 && rect.bottom > 0;
      const isAtTop = containerScrollTop < 50;

      if ((isVideoActive || isAtTop) && scrollAmount < maxScrollAmount) {
        e.preventDefault();
        e.stopPropagation();

        if (e.deltaY > 0) {
          setScrollAmount(prev => Math.min(maxScrollAmount, prev + e.deltaY));
        } else if (e.deltaY < 0 && scrollAmount > 0) {
          setScrollAmount(prev => Math.max(0, prev + e.deltaY));
        }
      }
    };

    const handleScroll = () => {
      const scrollContainer = containerRef.current?.closest('[role="main"]') as HTMLElement;
      const containerScrollTop = scrollContainer?.scrollTop || 0;

      if (containerScrollTop <= 10) {
        setScrollAmount(0);
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    const scrollContainer = containerRef.current?.closest('[role="main"]') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true } as any);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollAmount, maxScrollAmount]);

  useEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          setVideoActive(true);
          observer.disconnect();
        }
      },
      { root: null, threshold: [0, 0.2, 0.4] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const progress = scrollAmount / maxScrollAmount;
  const scale = 0.5 + (progress * 0.5);
  const width = 70 + (progress * 15);
  const height = 60 + (progress * 20);
  const textOpacity = Math.max(0, 1 - (progress * 1.5));
  const bgOpacity = Math.max(0, 1 - (progress * 1.2));

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full z-40 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ opacity: bgOpacity }}
      >
        {bgImageSrc ? (
          <Image
            src={bgImageSrc}
            alt="Background"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">

        {/* Video/Image */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            width: `${width}%`,
            height: `${height}vh`,
            transform: `scale(${scale})`,
            transition: 'all 0.1s ease-out',
            boxShadow: `
              0 20px 40px -12px rgba(0, 0, 0, 0.25),
              0 8px 20px -5px rgba(0, 0, 0, 0.15),
              0 3px 8px -2px rgba(0, 0, 0, 0.1)
            `,
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))'
          }}
        >
          {mediaType === 'video' ? (
            videoActive ? (
              <video
                preload="none"
                poster={posterSrc}
                autoPlay
                muted
                loop
                playsInline
                disablePictureInPicture
                className="w-full h-full object-cover"
                controls={false}
              >
                {mediaSrcWebm && <source src={mediaSrcWebm} type="video/webm" />}
                <source src={mediaSrc} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={posterSrc || bgImageSrc}
                alt={title || 'Video poster'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 100vw"
                priority
              />
            )
          ) : (
            <Image
              src={mediaSrc}
              alt={title || 'Media'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 100vw"
            />
          )}

          <div
            className="absolute inset-0 bg-black/30"
            style={{ opacity: 1 - progress * 0.5 }}
          />
        </div>

        {/* Text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          style={{ opacity: textOpacity, transform: 'translateY(20px)' }}
        >
          {title && (
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                {title}
              </h1>
            </div>
          )}

          <div style={{ opacity: textOpacity }}>
            {children}
          </div>

          {scrollToExpand && (
            <p className="text-white/80 font-medium drop-shadow">
              {scrollToExpand}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ScrollExpandMedia;
