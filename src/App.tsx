import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CarouselProps {
  images: string[];
  itemWidth?: number;
  frameSize?: number;
  step?: number;
  animationDuration?: number;
  infinite?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({
  images,
  itemWidth = 130,
  frameSize = 3,
  step = 3,
  animationDuration = 1000,
  infinite = false,
}) => {
  const carouselListRef = useRef<HTMLUListElement>(null);
  const [currentIndex, setCurrentIndex] = useState(infinite ? frameSize : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [actualImages, setActualImages] = useState<string[]>(images);

  useEffect(() => {
    if (infinite && images.length > 0) {
      const duplicatedImages = [
        ...images.slice(-frameSize),
        ...images,
        ...images.slice(0, frameSize),
      ];

      setActualImages(duplicatedImages);

      setCurrentIndex(frameSize);
    } else {
      setActualImages(images);
      setCurrentIndex(0);
    }
  }, [images, infinite, frameSize]);

  const getOffset = useCallback(() => {
    return -currentIndex * itemWidth;
  }, [currentIndex, itemWidth]);

  useEffect(() => {
    if (carouselListRef.current) {
      carouselListRef.current.style.transform = `translateX(${getOffset()}px)`;
    }
  }, [getOffset]);

  useEffect(() => {
    const listElement = carouselListRef.current;

    const handleTransitionEnd = () => {
      setIsTransitioning(false);

      if (infinite) {
        if (currentIndex >= actualImages.length - frameSize) {
          carouselListRef.current!.style.transition = 'none';
          setCurrentIndex(frameSize);
        } else if (currentIndex < frameSize && currentIndex !== 0) {
          carouselListRef.current!.style.transition = 'none';
          setCurrentIndex(actualImages.length - 2 * frameSize);
        }
      }
    };

    if (listElement) {
      listElement.addEventListener('transitionend', handleTransitionEnd);
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [currentIndex, infinite, actualImages.length, frameSize]);

  const handleNext = () => {
    if (isTransitioning || images.length === 0) {
      return;
    }

    setIsTransitioning(true);

    carouselListRef.current!.style.transition = `transform ${animationDuration}ms ease-in-out`;

    let nextIndex = currentIndex + step;

    if (!infinite) {
      const maxIndex = actualImages.length - frameSize;

      if (nextIndex > maxIndex) {
        nextIndex = maxIndex;
      }
    }

    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    if (isTransitioning || images.length === 0) {
      return;
    }

    setIsTransitioning(true);

    carouselListRef.current!.style.transition = `transform ${animationDuration}ms ease-in-out`;

    let prevIndex = currentIndex - step;

    if (!infinite) {
      if (prevIndex < 0) {
        prevIndex = 0;
      }
    }

    setCurrentIndex(prevIndex);
  };

  const isPrevDisabled = !infinite && currentIndex === 0;
  const isNextDisabled =
    !infinite && currentIndex >= actualImages.length - frameSize;
  const canScroll = images.length > frameSize;

  return (
    <div
      className="relative overflow-hidden
      rounded-xl shadow-xl
      border border-gray-300
      bg-white"
      style={{ width: `${itemWidth * frameSize + 40}px` }}
    >
      <div className="flex items-center justify-center p-5">
        <ul
          ref={carouselListRef}
          className="flex transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(${getOffset()}px)`,
            transitionDuration: `${animationDuration}ms`,
          }}
        >
          {actualImages.map((image, index) => (
            <li
              key={index}
              className="flex-shrink-0 flex items-center justify-center p-2"
              style={{ width: `${itemWidth}px` }}
            >
              <img
                src={image}
                alt={`Carousel ${index + 1}`}
                className="w-full h-auto rounded-lg
                shadow-md border border-gray-200 object-cover"
                onError={e => {
                  const target = e.currentTarget;

                  target.src = `https://placehold.co/${itemWidth}x90/CCCCCC/666666?text=Error`;
                  target.alt = 'Load Error';
                }}
              />
            </li>
          ))}
        </ul>
      </div>

      <div
        className="absolute top-1/2
        left-0 right-0
        flex justify-between
        transform -translate-y-1/2 px-4"
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={isPrevDisabled || isTransitioning || !canScroll}
          className={`
            p-3 bg-blue-500
            text-white rounded-full
            shadow-lg hover:bg-blue-600
            focus:outline-none focus:ring-2
            focus:ring-blue-500
            focus:ring-opacity-75
            transition-all
            duration-300
            ease-in-out transform hover:scale-110
            ${isPrevDisabled || !canScroll ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label="Previous image"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleNext}
          data-cy="next"
          disabled={isNextDisabled || isTransitioning || !canScroll}
          className={`
            p-3 bg-blue-500
            text-white rounded-full
            shadow-lg hover:bg-blue-600
            focus:outline-none
            focus:ring-2 focus:ring-blue-500
            focus:ring-opacity-75
            transition-all duration-300
            ease-in-out transform hover:scale-110
            ${isNextDisabled || !canScroll ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label="Next image"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [itemWidth, setItemWidth] = useState(130);
  const [frameSize, setFrameSize] = useState(3);
  const [step, setStep] = useState(3);
  const [animationDuration, setAnimationDuration] = useState(1000);
  const [infinite, setInfinite] = useState(false);

  const images = [
    './img/1.png',
    './img/2.png',
    './img/3.png',
    './img/4.png',
    './img/5.png',
    './img/6.png',
    './img/7.png',
    './img/8.png',
    './img/9.png',
    './img/10.png',
  ];

  return (
    <div
      className="flex flex-col items-center
      justify-center min-h-screen
      bg-gray-100 p-4 font-sans
      text-gray-800"
    >
      <h1
        data-cy="title"
        className="text-4xl font-bold
        mb-8 text-blue-700
        rounded-lg p-2 shadow-md"
      >
        React Carousel
      </h1>

      {/* Configuration Inputs */}
      <div
        className="bg-white p-6 rounded-xl
        shadow-lg mb-8
        w-full max-w-lg flex flex-wrap
        justify-center gap-4
        border border-blue-200"
      >
        <label className="flex flex-col items-start w-full sm:w-auto">
          <span
            className="text-sm font-medium
          text-gray-600 mb-1"
          >
            Item Width (px):
          </span>
          <input
            type="number"
            value={itemWidth}
            onChange={e => setItemWidth(Math.max(1, parseInt(e.target.value)))}
            className="p-2 border border-gray-300
              rounded-md focus:ring-2
              focus:ring-blue-500
              focus:border-transparent
              transition duration-200
              w-full sm:w-32"
          />
        </label>
        <label className="flex flex-col items-start w-full sm:w-auto">
          <span
            className="text-sm font-medium
            text-gray-600 mb-1"
          >
            Frame Size:
          </span>
          <input
            type="number"
            value={frameSize}
            onChange={e => setFrameSize(Math.max(1, parseInt(e.target.value)))}
            className="p-2 border border-gray-300
              rounded-md focus:ring-2
              focus:ring-blue-500
              focus:border-transparent
              transition duration-200
              w-full sm:w-32"
          />
        </label>
        <label className="flex flex-col items-start w-full sm:w-auto">
          <span className="text-sm font-medium text-gray-600 mb-1">Step:</span>
          <input
            type="number"
            value={step}
            onChange={e => setStep(Math.max(1, parseInt(e.target.value)))}
            className="p-2 border border-gray-300
              rounded-md focus:ring-2
              focus:ring-blue-500
              focus:border-transparent
              transition duration-200
              w-full sm:w-32"
          />
        </label>
        <label className="flex flex-col items-start w-full sm:w-auto">
          <span
            className="text-sm font-medium
          text-gray-600 mb-1"
          >
            Animation Duration (ms):
          </span>
          <input
            type="number"
            value={animationDuration}
            onChange={e =>
              setAnimationDuration(Math.max(0, parseInt(e.target.value)))
            }
            className="p-2 border border-gray-300
            rounded-md focus:ring-2
            focus:ring-blue-500
            focus:border-transparent
            transition duration-200
            w-full sm:w-32"
          />
        </label>
        <label className="flex items-center mt-2 w-full justify-center">
          <input
            type="checkbox"
            checked={infinite}
            onChange={e => setInfinite(e.target.checked)}
            className="mr-2 h-4 w-4
              text-blue-600
              border-gray-300
              rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Infinite Carousel
          </span>
        </label>
      </div>

      {/* Carousel Component */}
      <Carousel
        images={images}
        itemWidth={itemWidth}
        frameSize={frameSize}
        step={step}
        animationDuration={animationDuration}
        infinite={infinite}
      />
    </div>
  );
};

export default App;
