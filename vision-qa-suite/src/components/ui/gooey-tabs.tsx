// components/ui/gooey-tabs.tsx
import React, { useRef, useEffect, useState } from 'react';

interface GooeyTabItem {
  label: string;
  value: string;
  count?: number;
}

export interface GooeyTabsProps {
  items: GooeyTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  particleCount?: number;
  animationTime?: number;
  className?: string;
}

const GooeyTabs: React.FC<GooeyTabsProps> = ({
  items,
  value,
  onValueChange,
  particleCount = 12,
  animationTime = 600,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(() => 
    items.findIndex(item => item.value === value)
  );

  const noise = (n = 1) => n / 2 - Math.random() * n;
  
  const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: Math.floor(Math.random() * 4) + 1,
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  const makeParticles = (element: HTMLElement) => {
    const d: [number, number] = [90, 10];
    const r = 100;
    const bubbleTime = animationTime * 2 + 300;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(300 * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');
      
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, #3b82f6)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {}
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.querySelector('.tab-label')?.textContent || '';
  };

  const handleClick = (index: number, tabValue: string) => {
    if (activeIndex === index) return;
    
    setActiveIndex(index);
    onValueChange(tabValue);
    
    const liEl = navRef.current?.querySelectorAll('li')[index] as HTMLElement;
    if (liEl) {
      updateEffectPosition(liEl);
      
      if (filterRef.current) {
        const particles = filterRef.current.querySelectorAll('.particle');
        particles.forEach(p => filterRef.current!.removeChild(p));
      }
      
      if (textRef.current) {
        textRef.current.classList.remove('active');
        void textRef.current.offsetWidth;
        textRef.current.classList.add('active');
      }
      
      if (filterRef.current) {
        makeParticles(filterRef.current);
      }
    }
  };

  useEffect(() => {
    const newIndex = items.findIndex(item => item.value === value);
    if (newIndex !== -1 && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [value, items]);

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex] as HTMLElement;
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add('active');
    }
    
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex] as HTMLElement;
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex, items]);

  return (
    <>
      <style>
        {`
          .gooey-tabs-container {
            --color-1: #3b82f6;
            --color-2: #8b5cf6;
            --color-3: #ec4899;
            --color-4: #10b981;
          }
          
          .gooey-effect {
            position: absolute;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
          }
          
          .gooey-effect.text {
            color: white;
            font-weight: 600;
            transition: color 0.3s ease;
            font-size: 0.875rem;
          }
          
          .gooey-effect.text.active {
            color: white;
          }
          
          .gooey-effect.filter {
            filter: blur(7px) contrast(100) blur(0);
            mix-blend-mode: lighten;
            border-radius: 8px;
          }
          
          .gooey-effect.filter::before {
            content: "";
            position: absolute;
            inset: -75px;
            z-index: -2;
            background: hsl(var(--background));
          }
          
          .gooey-effect.filter::after {
            content: "";
            position: absolute;
            inset: 0;
            background: hsl(var(--primary));
            transform: scale(0);
            opacity: 0;
            z-index: -1;
            border-radius: 6px;
          }
          
          .gooey-effect.active::after {
            animation: pill 0.3s ease both;
          }
          
          @keyframes pill {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          .particle,
          .point {
            display: block;
            opacity: 0;
            width: 16px;
            height: 16px;
            border-radius: 9999px;
            transform-origin: center;
          }
          
          .particle {
            --time: 5s;
            position: absolute;
            top: calc(50% - 6px);
            left: calc(50% - 6px);
            animation: particle calc(var(--time)) ease 1 -350ms;
          }
          
          .point {
            background: var(--color);
            opacity: 1;
            animation: point calc(var(--time)) ease 1 -350ms;
          }
          
          @keyframes particle {
            0% {
              transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y)));
              opacity: 1;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            70% {
              transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: rotate(calc(var(--rotate) * 0.66)) translate(calc(var(--end-x)), calc(var(--end-y)));
              opacity: 1;
            }
            100% {
              transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
              opacity: 1;
            }
          }
          
          @keyframes point {
            0% {
              transform: scale(0);
              opacity: 0;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            25% {
              transform: scale(calc(var(--scale) * 0.25));
            }
            38% {
              opacity: 1;
            }
            65% {
              transform: scale(var(--scale));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: scale(var(--scale));
              opacity: 1;
            }
            100% {
              transform: scale(0);
              opacity: 0;
            }
          }
          
          .gooey-tab.active {
            color: white;
          }
          
          .gooey-tab.active::after {
            opacity: 1;
            transform: scale(1);
          }
          
          .gooey-tab::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 6px;
            background: hsl(var(--primary));
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s ease;
            z-index: -1;
          }
          
          .gooey-tab:hover::after {
            opacity: 0.1;
            transform: scale(1);
          }
        `}
      </style>
      
      <div 
        ref={containerRef} 
        className={`gooey-tabs-container relative inline-flex rounded-lg bg-muted/50 p-1 ${className}`}
      >
        <nav className="flex relative" style={{ transform: 'translate3d(0,0,0.01px)' }}>
          <ul
            ref={navRef}
            className="flex gap-1 list-none p-0 m-0 relative z-[3]"
          >
            {items.map((item, index) => (
              <li
                key={item.value}
                className={`gooey-tab relative cursor-pointer transition-all duration-300 ease-in-out rounded-md ${
                  activeIndex === index ? 'active' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <button
                  onClick={() => handleClick(index, item.value)}
                  className="outline-none py-2 px-4 inline-flex items-center gap-2 relative z-10 text-sm font-medium transition-colors"
                >
                  <span className="tab-label">{item.label}</span>
                  {item.count !== undefined && (
                    <span className={`inline-flex items-center justify-center min-w-6 h-6 text-xs rounded-full px-1.5 transition-colors ${
                      activeIndex === index 
                        ? 'bg-white text-primary' 
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <span className="gooey-effect filter" ref={filterRef} />
        <span className="gooey-effect text" ref={textRef} />
      </div>
    </>
  );
};

export default GooeyTabs;// components/ui/gooey-tabs.tsx
import React, { useRef, useEffect, useState } from 'react';

interface GooeyTabItem {
  label: string;
  value: string;
  count?: number;
}

export interface GooeyTabsProps {
  items: GooeyTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  particleCount?: number;
  animationTime?: number;
  className?: string;
}

const GooeyTabs: React.FC<GooeyTabsProps> = ({
  items,
  value,
  onValueChange,
  particleCount = 12,
  animationTime = 600,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(() => 
    items.findIndex(item => item.value === value)
  );

  const noise = (n = 1) => n / 2 - Math.random() * n;
  
  const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: Math.floor(Math.random() * 4) + 1,
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  const makeParticles = (element: HTMLElement) => {
    const d: [number, number] = [90, 10];
    const r = 100;
    const bubbleTime = animationTime * 2 + 300;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(300 * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');
      
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, #3b82f6)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {}
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.querySelector('.tab-label')?.textContent || '';
  };

  const handleClick = (index: number, tabValue: string) => {
    if (activeIndex === index) return;
    
    setActiveIndex(index);
    onValueChange(tabValue);
    
    const liEl = navRef.current?.querySelectorAll('li')[index] as HTMLElement;
    if (liEl) {
      updateEffectPosition(liEl);
      
      if (filterRef.current) {
        const particles = filterRef.current.querySelectorAll('.particle');
        particles.forEach(p => filterRef.current!.removeChild(p));
      }
      
      if (textRef.current) {
        textRef.current.classList.remove('active');
        void textRef.current.offsetWidth;
        textRef.current.classList.add('active');
      }
      
      if (filterRef.current) {
        makeParticles(filterRef.current);
      }
    }
  };

  useEffect(() => {
    const newIndex = items.findIndex(item => item.value === value);
    if (newIndex !== -1 && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [value, items]);

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex] as HTMLElement;
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add('active');
    }
    
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex] as HTMLElement;
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex, items]);

  return (
    <>
      <style>
        {`
          .gooey-tabs-container {
            --color-1: #3b82f6;
            --color-2: #8b5cf6;
            --color-3: #ec4899;
            --color-4: #10b981;
          }
          
          .gooey-effect {
            position: absolute;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
          }
          
          .gooey-effect.text {
            color: white;
            font-weight: 600;
            transition: color 0.3s ease;
            font-size: 0.875rem;
          }
          
          .gooey-effect.text.active {
            color: white;
          }
          
          .gooey-effect.filter {
            filter: blur(7px) contrast(100) blur(0);
            mix-blend-mode: lighten;
            border-radius: 8px;
          }
          
          .gooey-effect.filter::before {
            content: "";
            position: absolute;
            inset: -75px;
            z-index: -2;
            background: hsl(var(--background));
          }
          
          .gooey-effect.filter::after {
            content: "";
            position: absolute;
            inset: 0;
            background: hsl(var(--primary));
            transform: scale(0);
            opacity: 0;
            z-index: -1;
            border-radius: 6px;
          }
          
          .gooey-effect.active::after {
            animation: pill 0.3s ease both;
          }
          
          @keyframes pill {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          .particle,
          .point {
            display: block;
            opacity: 0;
            width: 16px;
            height: 16px;
            border-radius: 9999px;
            transform-origin: center;
          }
          
          .particle {
            --time: 5s;
            position: absolute;
            top: calc(50% - 6px);
            left: calc(50% - 6px);
            animation: particle calc(var(--time)) ease 1 -350ms;
          }
          
          .point {
            background: var(--color);
            opacity: 1;
            animation: point calc(var(--time)) ease 1 -350ms;
          }
          
          @keyframes particle {
            0% {
              transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y)));
              opacity: 1;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            70% {
              transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: rotate(calc(var(--rotate) * 0.66)) translate(calc(var(--end-x)), calc(var(--end-y)));
              opacity: 1;
            }
            100% {
              transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
              opacity: 1;
            }
          }
          
          @keyframes point {
            0% {
              transform: scale(0);
              opacity: 0;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            25% {
              transform: scale(calc(var(--scale) * 0.25));
            }
            38% {
              opacity: 1;
            }
            65% {
              transform: scale(var(--scale));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: scale(var(--scale));
              opacity: 1;
            }
            100% {
              transform: scale(0);
              opacity: 0;
            }
          }
          
          .gooey-tab.active {
            color: white;
          }
          
          .gooey-tab.active::after {
            opacity: 1;
            transform: scale(1);
          }
          
          .gooey-tab::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 6px;
            background: hsl(var(--primary));
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s ease;
            z-index: -1;
          }
          
          .gooey-tab:hover::after {
            opacity: 0.1;
            transform: scale(1);
          }
        `}
      </style>
      
      <div 
        ref={containerRef} 
        className={`gooey-tabs-container relative inline-flex rounded-lg bg-muted/50 p-1 ${className}`}
      >
        <nav className="flex relative" style={{ transform: 'translate3d(0,0,0.01px)' }}>
          <ul
            ref={navRef}
            className="flex gap-1 list-none p-0 m-0 relative z-[3]"
          >
            {items.map((item, index) => (
              <li
                key={item.value}
                className={`gooey-tab relative cursor-pointer transition-all duration-300 ease-in-out rounded-md ${
                  activeIndex === index ? 'active' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <button
                  onClick={() => handleClick(index, item.value)}
                  className="outline-none py-2 px-4 inline-flex items-center gap-2 relative z-10 text-sm font-medium transition-colors"
                >
                  <span className="tab-label">{item.label}</span>
                  {item.count !== undefined && (
                    <span className={`inline-flex items-center justify-center min-w-6 h-6 text-xs rounded-full px-1.5 transition-colors ${
                      activeIndex === index 
                        ? 'bg-white text-primary' 
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <span className="gooey-effect filter" ref={filterRef} />
        <span className="gooey-effect text" ref={textRef} />
      </div>
    </>
  );
};

export default GooeyTabs;